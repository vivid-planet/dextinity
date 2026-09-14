import { AffectedEntity, CurrentUser, GetCurrentUser, PaginatedResponseFactory, RequiredPermission } from "@dextinity/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository, FilterQuery } from "@mikro-orm/postgresql";
import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, Int, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { EmailCampaignScopeInterface } from "../types";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactInputInterface, BrevoContactUpdateInputInterface } from "./dto/brevo-contact-input.factory";
import { BrevoContactsArgsFactory } from "./dto/brevo-contacts.args";
import { BrevoTestContactInputInterface } from "./dto/brevo-test-contact-input.factory";
import { ManuallyAssignedBrevoContactsArgs } from "./dto/manually-assigned-brevo-contacts.args";
import { SubscribeInputInterface } from "./dto/subscribe-input.factory";
import { SubscribeResponse } from "./dto/subscribe-response.enum";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";

export function createBrevoContactResolver({
    BrevoContact,
    BrevoContactSubscribeInput,
    Scope,
    BrevoContactInput,
    BrevoContactUpdateInput,
    BrevoTestContactInput,
}: {
    BrevoContact: Type<BrevoContactInterface>;
    BrevoContactSubscribeInput: Type<SubscribeInputInterface>;
    BrevoContactInput: Type<BrevoContactInputInterface>;
    BrevoContactUpdateInput: Type<Partial<BrevoContactInputInterface>>;
    BrevoTestContactInput: Type<BrevoTestContactInputInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedBrevoContacts extends PaginatedResponseFactory.create(BrevoContact) {}

    @ArgsType()
    class BrevoContactsArgs extends BrevoContactsArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoContact)
    @RequiredPermission(["brevoNewsletter"], { skipScopeCheck: true })
    class BrevoContactResolver {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
            private readonly brevoContactsApiService: BrevoApiContactsService,
            private readonly brevoContactsService: BrevoContactsService,
            private readonly ecgRtrListService: EcgRtrListService,
            private readonly targetGroupService: TargetGroupsService,
            @InjectRepository("BrevoTargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => BrevoContact)
        @AffectedEntity(BrevoContact)
        async brevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
        ): Promise<BrevoContactInterface> {
            const brevoContact = await this.brevoContactsApiService.findContact(id, scope);

            if (!brevoContact) {
                throw new Error(`Brevo contact with id ${id} not found`);
            }

            return brevoContact;
        }

        @Query(() => PaginatedBrevoContacts)
        async brevoContacts(@Args() { offset, limit, email, targetGroupId, scope }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: true };

            if (targetGroupId) {
                where.id = targetGroupId;
                where.isMainList = false;
            }

            let targetGroup = await this.targetGroupRepository.findOne(where);

            if (!targetGroup) {
                if (targetGroupId) {
                    return new PaginatedBrevoContacts([], 0, { offset, limit });
                }

                // when there is no main target group for the scope, create one
                targetGroup = await this.targetGroupService.createIfNotExistMainTargetGroupForScope(scope);
            }

            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email, scope);
                if (contact && contact.listIds.includes(targetGroup.brevoId)) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }
            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(targetGroup.brevoId, limit, offset, targetGroup.scope);

            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Query(() => PaginatedBrevoContacts)
        async brevoTestContacts(@Args() { offset, limit, email, scope }: BrevoContactsArgs): Promise<PaginatedBrevoContacts> {
            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: false, isTestList: true };

            let targetGroup = await this.targetGroupRepository.findOne(where);

            if (!targetGroup) {
                // when there is no test target group for the scope, create one
                targetGroup = await this.targetGroupService.createIfNotExistTestTargetGroupForScope(scope);
            }

            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email, scope);
                if (contact && contact.listIds.includes(targetGroup.brevoId)) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }
            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(targetGroup.brevoId, limit, offset, targetGroup.scope);

            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Query(() => PaginatedBrevoContacts)
        async manuallyAssignedBrevoContacts(
            @Args() { offset, limit, email, targetGroupId }: ManuallyAssignedBrevoContactsArgs,
        ): Promise<PaginatedBrevoContacts> {
            const targetGroup = await this.targetGroupRepository.findOneOrFail({ id: targetGroupId });

            if (email) {
                const contact = await this.brevoContactsApiService.getContactInfoByEmail(email, targetGroup.scope);
                if (contact && contact.listIds.includes(targetGroup.brevoId)) {
                    return new PaginatedBrevoContacts([contact], 1, { offset, limit });
                }
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }

            if (!targetGroup.assignedContactsTargetGroupBrevoId) {
                return new PaginatedBrevoContacts([], 0, { offset, limit });
            }

            const [contacts, count] = await this.brevoContactsApiService.findContactsByListId(
                targetGroup.assignedContactsTargetGroupBrevoId,
                limit,
                offset,
                targetGroup.scope,
            );
            return new PaginatedBrevoContacts(contacts, count, { offset, limit });
        }

        @Mutation(() => BrevoContact)
        @AffectedEntity(BrevoContact)
        async updateBrevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
            @Args("input", { type: () => BrevoContactUpdateInput }) input: BrevoContactUpdateInputInterface,
        ): Promise<BrevoContactInterface> {
            // update attributes of contact before (un)assigning to target groups because they cannot be correctly validated for completeness
            const contact = await this.brevoContactsApiService.updateContact(
                id,
                {
                    blocked: input.blocked,
                    attributes: input.attributes,
                },
                scope,
            );

            const assignedListIds = contact.listIds;
            const mainListIds = (await this.targetGroupRepository.find({ brevoId: { $in: assignedListIds }, isMainList: true })).map(
                (targetGroup) => targetGroup.brevoId,
            );
            const updatedNonMainListIds = await this.brevoContactsService.getTargetGroupIdsForExistingContact({
                contact,
            });

            const testTargetGroup = await this.targetGroupRepository.findOne({ scope, isMainList: false, isTestList: true });
            const contactIncludesTestList = testTargetGroup?.brevoId ? contact.listIds.includes(testTargetGroup.brevoId) : false;

            if (testTargetGroup && contactIncludesTestList) {
                const testListId = testTargetGroup.brevoId;
                if (!updatedNonMainListIds.includes(testListId)) {
                    updatedNonMainListIds.push(testListId);
                }
            }

            // update contact again with updated list ids depending on new attributes

            const contactWithUpdatedLists = await this.brevoContactsApiService.updateContact(
                id,
                {
                    listIds: updatedNonMainListIds.filter((listId) => !assignedListIds.includes(listId)),
                    unlinkListIds: assignedListIds.filter((listId) => !updatedNonMainListIds.includes(listId) && !mainListIds.includes(listId)),
                },
                scope,
            );

            return contactWithUpdatedLists;
        }

        @Mutation(() => SubscribeResponse)
        @RequiredPermission(["brevoNewsletter"], { skipScopeCheck: true })
        async createBrevoContact(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
            @Args("input", { type: () => BrevoContactInput })
            input: BrevoContactInputInterface,
            @GetCurrentUser() user: CurrentUser,
        ): Promise<SubscribeResponse> {
            if ((await this.ecgRtrListService.getContainedEcgRtrListEmails([input.email])).length > 0) {
                return SubscribeResponse.ERROR_CONTAINED_IN_ECG_RTR_LIST;
            }

            const brevoConfig = await this.brevoConfigRepository.findOneOrFail({ scope });

            return this.brevoContactsService.createContact({
                email: input.email,
                attributes: input.attributes,
                redirectionUrl: input.redirectionUrl,
                scope,
                templateId: brevoConfig.doubleOptInTemplateId,
                sendDoubleOptIn: input.sendDoubleOptIn,
                responsibleUserId: user.id,
                contactSource: ContactSource.manualCreation,
            });
        }

        @Mutation(() => SubscribeResponse)
        @RequiredPermission(["brevoNewsletter"], { skipScopeCheck: true })
        async createBrevoTestContact(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
            @Args("input", { type: () => BrevoTestContactInput })
            input: BrevoContactInputInterface,
        ): Promise<SubscribeResponse> {
            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: false, isTestList: true };
            const targetGroup = await this.targetGroupRepository.findOne(where);
            const contact = await this.brevoContactsApiService.getContactInfoByEmail(input.email, scope);

            if (targetGroup) {
                const numberOfContacts = await this.brevoContactsApiService.getContactCountByListId(targetGroup.brevoId, scope);
                if (numberOfContacts >= 100) {
                    return SubscribeResponse.ERROR_MAXIMAL_NUMBER_OF_TEST_CONTACTS_REACHED;
                }
            }
            if (contact && targetGroup) {
                const listIds: number[] = contact.listIds ? [...contact.listIds] : [];
                listIds.push(targetGroup.brevoId);

                await this.brevoContactsApiService.updateContact(
                    contact.id,
                    {
                        listIds,
                    },
                    scope,
                );

                return SubscribeResponse.SUCCESSFUL;
            } else {
                const created = await this.brevoContactsService.createTestContact({
                    email: input.email,
                    attributes: input.attributes,
                    scope,
                });

                if (created) {
                    return SubscribeResponse.SUCCESSFUL;
                }

                return SubscribeResponse.ERROR_UNKNOWN;
            }
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoContact)
        async deleteBrevoContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
        ): Promise<boolean> {
            const contact = await this.brevoContactsApiService.findContact(id, scope);
            if (!contact) {
                return false;
            }

            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: false, isTestList: true };
            const testTargetGroup = await this.targetGroupRepository.findOne(where);
            const contactIncludesTestList = testTargetGroup?.brevoId ? contact.listIds.includes(testTargetGroup.brevoId) : false;

            if (testTargetGroup && contactIncludesTestList) {
                const testListId = testTargetGroup.brevoId;

                const unlinkListIds = contact.listIds.filter((id) => id !== testListId);

                await this.brevoContactsApiService.updateContact(
                    contact.id,
                    {
                        listIds: [testListId],
                        unlinkListIds,
                    },
                    scope,
                );
                return true;
            } else {
                return this.brevoContactsApiService.deleteContact(id, scope);
            }
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoContact)
        async deleteBrevoTestContact(
            @Args("id", { type: () => Int }) id: number,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope)) scope: typeof Scope,
        ): Promise<boolean> {
            const contact = await this.brevoContactsApiService.findContact(id, scope);
            if (!contact) {
                return false;
            }

            const where: FilterQuery<TargetGroupInterface> = { scope, isMainList: false, isTestList: true };
            const testTargetGroup = await this.targetGroupRepository.findOne(where);
            const mainTargetGroup = await this.targetGroupRepository.findOne({ scope, isMainList: true });
            const mainListIncludesContact = mainTargetGroup?.brevoId ? contact.listIds.includes(mainTargetGroup.brevoId) : false;

            if (testTargetGroup && mainListIncludesContact) {
                const testListId = testTargetGroup.brevoId;

                const linkListIds = contact.listIds.filter((id) => id !== testListId);

                await this.brevoContactsApiService.updateContact(
                    contact.id,
                    {
                        listIds: linkListIds,
                        unlinkListIds: [testListId],
                    },
                    scope,
                );
                return true;
            } else {
                return this.brevoContactsApiService.deleteContact(id, scope);
            }
        }

        @Mutation(() => SubscribeResponse)
        async subscribeBrevoContact(
            @Args("input", { type: () => BrevoContactSubscribeInput }) data: SubscribeInputInterface,
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
        ): Promise<SubscribeResponse> {
            return this.brevoContactsService.subscribeBrevoContact(data, scope);
        }
    }

    return BrevoContactResolver;
}
