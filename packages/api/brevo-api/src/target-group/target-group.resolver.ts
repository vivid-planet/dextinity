import { AffectedEntity, PaginatedResponseFactory, RequiredPermission, validateNotModified } from "@dextinity/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, FindOptions, wrap } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Args, ArgsType, ID, Int, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { EmailCampaignScopeInterface } from "src/types";

import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { DynamicDtoValidationPipe } from "../validation/dynamic-dto-validation.pipe";
import { AddBrevoContactsInput } from "./dto/add-brevo-contacts.input";
import { RemoveBrevoContactInput } from "./dto/remove-brevo-contact.input";
import { TargetGroupArgsFactory } from "./dto/target-group-args.factory";
import { TargetGroupInputInterface } from "./dto/target-group-input.factory";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";
import { TargetGroupsService } from "./target-groups.service";

export function createTargetGroupsResolver({
    BrevoTargetGroup,
    TargetGroupInput,
    TargetGroupUpdateInput,
    Scope,
}: {
    BrevoTargetGroup: Type<TargetGroupInterface>;
    TargetGroupInput: Type<TargetGroupInputInterface>;
    TargetGroupUpdateInput: Type<Partial<TargetGroupInputInterface>>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ObjectType()
    class PaginatedTargetGroups extends PaginatedResponseFactory.create(BrevoTargetGroup) {}

    @ArgsType()
    class TargetGroupsArgs extends TargetGroupArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoTargetGroup)
    @RequiredPermission(["brevoNewsletter"])
    class TargetGroupResolver {
        constructor(
            private readonly targetGroupsService: TargetGroupsService,
            private readonly brevoApiContactsService: BrevoApiContactsService,
            private readonly entityManager: EntityManager,
            @InjectRepository("BrevoTargetGroup") private readonly repository: EntityRepository<TargetGroupInterface>,
        ) {}

        @Query(() => BrevoTargetGroup)
        @AffectedEntity(BrevoTargetGroup)
        async brevoTargetGroup(@Args("id", { type: () => ID }) id: string): Promise<TargetGroupInterface> {
            const targetGroup = await this.repository.findOneOrFail(id);
            return targetGroup;
        }

        @Query(() => PaginatedTargetGroups)
        async brevoTargetGroups(@Args() { search, filter, sort, offset, limit, scope }: TargetGroupsArgs): Promise<PaginatedTargetGroups> {
            const where = this.targetGroupsService.getFindCondition({ search, filter });
            where.scope = scope;
            where.isTestList = false;

            const options: FindOptions<TargetGroupInterface> = { offset, limit };

            if (sort) {
                options.orderBy = sort.map((sortItem) => {
                    return {
                        [sortItem.field]: sortItem.direction,
                    };
                });
            }

            const [entities, totalCount] = await this.repository.findAndCount(where, options);

            const brevoContactLists = await this.brevoApiContactsService.findBrevoContactListsByIds(
                entities.map((list) => list.brevoId),
                scope,
            );

            for (const contactList of entities) {
                const brevoContactList = brevoContactLists.find((item) => item.id === contactList.brevoId);

                if (brevoContactList) {
                    contactList.totalSubscribers = brevoContactList.uniqueSubscribers;
                }
            }

            return new PaginatedTargetGroups(entities, totalCount);
        }

        @Mutation(() => BrevoTargetGroup)
        async createBrevoTargetGroup(
            @Args("scope", { type: () => Scope }, new DynamicDtoValidationPipe(Scope))
            scope: typeof Scope,
            @Args("input", { type: () => TargetGroupInput }, new DynamicDtoValidationPipe(TargetGroupInput)) input: TargetGroupInputInterface,
        ): Promise<TargetGroupInterface> {
            const brevoId = await this.brevoApiContactsService.createBrevoContactList(input.title, scope);

            if (brevoId) {
                const targetGroup = this.repository.create({ ...input, brevoId, scope, isMainList: false, isTestList: false });

                await this.entityManager.flush();

                if (input.filters) {
                    await this.targetGroupsService.assignContactsToContactList(targetGroup, targetGroup.scope, input.filters);
                }

                return targetGroup;
            }

            throw new Error("Brevo Error: Could not create target group in brevo");
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoTargetGroup)
        async addBrevoContactsToTargetGroup(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => AddBrevoContactsInput }) input: AddBrevoContactsInput,
        ): Promise<boolean> {
            const targetGroup = await this.repository.findOneOrFail(id);
            const assignedContactsTargetGroupBrevoId =
                await this.targetGroupsService.createIfNotExistsManuallyAssignedContactsTargetGroup(targetGroup);

            return this.brevoApiContactsService.updateMultipleContacts(
                input.brevoContactIds.map((brevoContactId) => ({
                    id: brevoContactId,
                    listIds: [targetGroup.brevoId, assignedContactsTargetGroupBrevoId],
                })),
                targetGroup.scope,
            );
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoTargetGroup)
        async removeBrevoContactFromTargetGroup(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => RemoveBrevoContactInput }) input: RemoveBrevoContactInput,
        ): Promise<boolean> {
            const targetGroup = await this.repository.findOneOrFail(id);
            const assignedContactsTargetGroupBrevoId = targetGroup.assignedContactsTargetGroupBrevoId;
            const brevoContact = await this.brevoApiContactsService.findContact(input.brevoContactId, targetGroup.scope);

            if (!assignedContactsTargetGroupBrevoId) {
                throw new Error("No assigned contacts target group found");
            }

            if (!brevoContact) {
                throw new Error(`Brevo contact with id ${input.brevoContactId} not found`);
            }

            const contactIsInTargetGroupByAttributes = this.targetGroupsService.checkIfContactIsInTargetGroupByAttributes(
                brevoContact.attributes,
                targetGroup.filters,
            );

            const updatedBrevoContact = await this.brevoApiContactsService.updateContact(
                input.brevoContactId,
                {
                    unlinkListIds: contactIsInTargetGroupByAttributes
                        ? [assignedContactsTargetGroupBrevoId]
                        : [targetGroup.brevoId, assignedContactsTargetGroupBrevoId],
                },
                targetGroup.scope,
            );

            return updatedBrevoContact ? true : false;
        }

        @Mutation(() => BrevoTargetGroup)
        @AffectedEntity(BrevoTargetGroup)
        async updateBrevoTargetGroup(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => TargetGroupUpdateInput }, new DynamicDtoValidationPipe(TargetGroupUpdateInput))
            input: Partial<TargetGroupInputInterface>,
            @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        ): Promise<TargetGroupInterface> {
            const targetGroup = await this.repository.findOneOrFail(id);

            if (targetGroup.isMainList) {
                throw new Error("Cannot edit a main target group");
            }

            if (lastUpdatedAt) {
                validateNotModified(targetGroup, lastUpdatedAt);
            }

            await this.targetGroupsService.assignContactsToContactList(targetGroup, targetGroup.scope, input.filters);

            if (input.title && input.title !== targetGroup.title) {
                const successfullyUpdatedContactList = await this.brevoApiContactsService.updateBrevoContactList(
                    targetGroup.brevoId,
                    input.title,
                    targetGroup.scope,
                );
                if (!successfullyUpdatedContactList) {
                    throw Error("Brevo Error: Could not update contact list");
                }
            }

            wrap(targetGroup).assign({
                ...input,
            });

            await this.entityManager.flush();

            return targetGroup;
        }

        @Mutation(() => Boolean)
        @AffectedEntity(BrevoTargetGroup)
        async deleteBrevoTargetGroup(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            const targetGroup = await this.repository.findOneOrFail(id);

            if (targetGroup.isMainList) {
                throw new Error("Cannot delete a main target group");
            }

            const isDeletedInBrevo = await this.brevoApiContactsService.deleteBrevoContactList(targetGroup.brevoId, targetGroup.scope);

            if (!isDeletedInBrevo) {
                return false;
            }

            this.entityManager.remove(targetGroup);
            await this.entityManager.flush();

            return true;
        }

        @ResolveField(() => Int)
        async brevoTotalSubscribers(@Parent() targetGroup: TargetGroupInterface): Promise<number> {
            if (targetGroup.totalSubscribers !== undefined) {
                return targetGroup.totalSubscribers;
            }

            const { uniqueSubscribers } = await this.brevoApiContactsService.findBrevoContactListById(targetGroup.brevoId, targetGroup.scope);

            return uniqueSubscribers;
        }
    }

    return TargetGroupResolver;
}
