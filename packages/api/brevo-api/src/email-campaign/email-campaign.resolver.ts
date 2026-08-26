import { AffectedEntity, extractGraphqlFields, PaginatedResponseFactory, RequiredPermission, validateNotModified } from "@dextinity/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Info, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";

import { BrevoApiCampaignsService } from "../brevo-api/brevo-api-campaigns.service";
import { BrevoApiCampaignStatistics } from "../brevo-api/dto/brevo-api-campaign-statistics";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { EmailCampaignScopeInterface } from "../types";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { EmailCampaignArgsFactory } from "./dto/email-campaign-args.factory";
import { EmailCampaignInputInterface } from "./dto/email-campaign-input.factory";
import { SendTestEmailCampaignArgs } from "./dto/send-test-email-campaign.args";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";
import { SendingState } from "./sending-state.enum";

export function createEmailCampaignsResolver({
    BrevoEmailCampaign,
    EmailCampaignInput,
    EmailCampaignUpdateInput,
    Scope,
    BrevoTargetGroup,
}: {
    BrevoEmailCampaign: Type<EmailCampaignInterface>;
    EmailCampaignInput: Type<EmailCampaignInputInterface>;
    EmailCampaignUpdateInput: Type<Partial<EmailCampaignInputInterface>>;
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoTargetGroup: Type<TargetGroupInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedEmailCampaigns extends PaginatedResponseFactory.create(BrevoEmailCampaign) {}

    @ArgsType()
    class EmailCampaignsArgs extends EmailCampaignArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoEmailCampaign)
    @RequiredPermission(["brevoNewsletter"])
    class EmailCampaignsResolver {
        constructor(
            private readonly campaignsService: EmailCampaignsService,
            private readonly brevoApiCampaignsService: BrevoApiCampaignsService,
            private readonly ecgRtrListService: EcgRtrListService,
            private readonly entityManager: EntityManager,
            @InjectRepository("BrevoEmailCampaign") private readonly repository: EntityRepository<EmailCampaignInterface>,
            @InjectRepository("BrevoTargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => BrevoEmailCampaign)
        @AffectedEntity(BrevoEmailCampaign)
        async brevoEmailCampaign(@Args("id", { type: () => ID }) id: string): Promise<EmailCampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);
            return campaign;
        }

        @Query(() => PaginatedEmailCampaigns)
        async brevoEmailCampaigns(
            @Args() { search, filter, sort, offset, limit, scope }: EmailCampaignsArgs,
            @Info() info: GraphQLResolveInfo,
        ): Promise<PaginatedEmailCampaigns> {
            const where = this.campaignsService.getFindCondition({ search, filter });
            where.scope = scope;

            const fields = extractGraphqlFields(info, { root: "nodes" });
            const populate: string[] = [];
            if (fields.includes("targetGroups")) {
                populate.push("targetGroups");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: FindOptions<EmailCampaignInterface, any> = { offset, limit, populate };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);

            const emailCampaigns = this.campaignsService.loadEmailCampaignSendingStatesForEmailCampaigns(entities, scope);

            return new PaginatedEmailCampaigns(emailCampaigns, totalCount);
        }

        @Mutation(() => BrevoEmailCampaign)
        async createBrevoEmailCampaign(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => EmailCampaignInput }, new DynamicDtoValidationPipe(EmailCampaignInput)) input: EmailCampaignInputInterface,
        ): Promise<EmailCampaignInterface> {
            const campaign = this.repository.create({
                ...input,
                scope,
                content: input.content.transformToBlockData(),
                scheduledAt: input.scheduledAt ?? undefined,
                sendingState: input.scheduledAt ? SendingState.SCHEDULED : SendingState.DRAFT,
            });

            if (input.scheduledAt) {
                await this.campaignsService.saveEmailCampaignInBrevo(campaign, input.scheduledAt);
            }

            await this.entityManager.flush();

            return campaign;
        }

        @Mutation(() => BrevoEmailCampaign)
        @AffectedEntity(BrevoEmailCampaign)
        async updateBrevoEmailCampaign(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => EmailCampaignUpdateInput }, new DynamicDtoValidationPipe(EmailCampaignUpdateInput))
            input: Partial<EmailCampaignInputInterface>,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<EmailCampaignInterface> {
            const campaign = await this.repository.findOneOrFail(id);

            if (lastUpdatedAt) {
                validateNotModified(campaign, lastUpdatedAt);
            }

            const { brevoTargetGroups, ...restInput } = input;
            wrap(campaign).assign({
                ...restInput,
                targetGroups: brevoTargetGroups,
                content: input.content ? input.content.transformToBlockData() : undefined,
            });

            await this.entityManager.flush();

            const now = new Date();
            let hasScheduleRemoved = false;

            if (campaign.brevoId) {
                if (campaign.sendingState === SendingState.SENT) {
                    throw new Error("Cannot update email campaign that has already been sent.");
                }

                // If campaign is scheduled in the past, check actual status from Brevo
                if (campaign.sendingState === SendingState.SCHEDULED && campaign.scheduledAt && campaign.scheduledAt < now) {
                    const brevoCampaign = await this.brevoApiCampaignsService.loadBrevoCampaignById(campaign);
                    const actualState = this.brevoApiCampaignsService.getSendingInformationFromBrevoCampaign(brevoCampaign);

                    // If campaign was sent, don't allow updates
                    if (actualState === SendingState.SENT) {
                        wrap(campaign).assign({ sendingState: SendingState.SENT });
                        await this.entityManager.flush();
                        throw new Error("Cannot update email campaign that has already been sent.");
                    }

                    // If campaign is still scheduled or in draft, allow updates by resetting state
                    wrap(campaign).assign({ sendingState: actualState });
                }

                hasScheduleRemoved = input.scheduledAt === null && campaign.scheduledAt !== null;
                if (hasScheduleRemoved && !(campaign.sendingState === SendingState.DRAFT)) {
                    wrap(campaign).assign({ sendingState: SendingState.DRAFT });
                    await this.campaignsService.suspendEmailCampaign(campaign);
                }
            }

            if (!hasScheduleRemoved && input.scheduledAt) {
                wrap(campaign).assign({ sendingState: SendingState.SCHEDULED });
                await this.campaignsService.saveEmailCampaignInBrevo(campaign, input.scheduledAt);
            }

            await this.entityManager.flush();

            return campaign;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoEmailCampaign)
        async deleteBrevoEmailCampaign(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);

            if (campaign.brevoId) {
                throw new Error("Cannot delete campaign that has already been scheduled once before.");
            }

            await this.entityManager.remove(campaign);
            await this.entityManager.flush();
            return true;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoEmailCampaign)
        async sendBrevoEmailCampaignNow(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);

            const campaignSent = await this.campaignsService.sendEmailCampaignNow(campaign);

            if (campaignSent) {
                const campaign = await this.repository.findOneOrFail(id);

                wrap(campaign).assign({
                    scheduledAt: new Date(),
                    sendingState: SendingState.SCHEDULED,
                });

                await this.entityManager.flush();

                return true;
            }

            return false;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoEmailCampaign)
        async sendBrevoEmailCampaignToTestEmails(
            @Args("id", { type: () => ID }) id: string,
            @Args("data", { type: () => SendTestEmailCampaignArgs }) data: SendTestEmailCampaignArgs,
        ): Promise<boolean> {
            const campaign = await this.repository.findOneOrFail(id);
            const brevoCampaign = await this.campaignsService.saveEmailCampaignInBrevo(campaign);

            const containedEcgRtrListEmails = await this.ecgRtrListService.getContainedEcgRtrListEmails(data.emails);
            const emailsNotInEcgRtrList = data.emails.filter((email) => !containedEcgRtrListEmails.includes(email));

            if (brevoCampaign.brevoId) {
                return this.brevoApiCampaignsService.sendTestEmail(brevoCampaign, emailsNotInEcgRtrList);
            }

            return false;
        }

        @Query(() => BrevoApiCampaignStatistics, { nullable: true })
        @AffectedEntity(BrevoEmailCampaign)
        async brevoEmailCampaignStatistics(@Args("id", { type: () => ID }) id: string): Promise<BrevoApiCampaignStatistics | null> {
            const campaign = await this.repository.findOneOrFail(id);

            return campaign.brevoId ? this.brevoApiCampaignsService.loadBrevoCampaignStatisticsById(campaign) : null;
        }

        @ResolveField(() => SendingState)
        async sendingState(@Parent() campaign: EmailCampaignInterface): Promise<SendingState> {
            if (campaign.sendingState === SendingState.SCHEDULED && campaign.scheduledAt && campaign.scheduledAt < new Date()) {
                const brevoCampaign = await this.brevoApiCampaignsService.loadBrevoCampaignById(campaign);

                const state = this.brevoApiCampaignsService.getSendingInformationFromBrevoCampaign(brevoCampaign);

                wrap(campaign).assign({ sendingState: state });
                await this.entityManager.flush();
            }

            return campaign.sendingState;
        }

        @ResolveField(() => [BrevoTargetGroup])
        async brevoTargetGroups(@Parent() emailCampaign: EmailCampaignInterface): Promise<TargetGroupInterface[] | undefined> {
            return emailCampaign.targetGroups.loadItems();
        }
    }

    return EmailCampaignsResolver;
}
