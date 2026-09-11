import { filtersToMikroOrmQuery, searchToMikroOrmQuery } from "@dextinity/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, FilterQuery, ObjectQuery, wrap } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { stringify } from "querystring";

import { handleBrevoError } from "../brevo-api/brevo-api.utils";
import { BrevoApiContactsService } from "../brevo-api/brevo-api-contact.service";
import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoContactAttributesInterface, BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { TargetGroupFilter } from "./dto/target-group.filter";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";

@Injectable()
export class TargetGroupsService {
    constructor(
        @InjectRepository("BrevoTargetGroup") private readonly repository: EntityRepository<TargetGroupInterface>,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly entityManager: EntityManager,
    ) {}

    getFindCondition(options: { search?: string; filter?: TargetGroupFilter }): ObjectQuery<TargetGroupInterface> {
        const andFilters = [];

        if (options.search) {
            andFilters.push(searchToMikroOrmQuery(options.search, ["title"]));
        }

        if (options.filter) {
            andFilters.push(filtersToMikroOrmQuery(options.filter));
        }

        return andFilters.length > 0 ? { $and: andFilters } : {};
    }

    public checkIfContactIsInTargetGroupByAttributes(
        contactAttributes?: BrevoContactAttributesInterface,
        filters?: BrevoContactFilterAttributesInterface,
    ): boolean {
        if (filters && contactAttributes) {
            for (const [key, value] of Object.entries(filters)) {
                if (!value || value.length === 0) {
                    continue;
                }

                let isFound = false;

                if (Array.isArray(contactAttributes[key])) {
                    for (const attribute of contactAttributes[key]) {
                        if (value.includes(attribute)) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        continue;
                    }
                } else if (value.includes(contactAttributes[key])) {
                    continue;
                }
                return false;
            }
            return true;
        }
        return false;
    }

    public async assignContactsToContactList(
        targetGroup: TargetGroupInterface,
        scope: EmailCampaignScopeInterface,
        filters?: BrevoContactFilterAttributesInterface,
    ): Promise<true> {
        try {
            const mainScopeTargetGroupList = await this.repository.findOneOrFail({ scope, isMainList: true });

            let offset = 0;
            let totalCount = 0;
            do {
                try {
                    const [contacts, totalContacts] = await this.brevoApiContactsService.findContactsByListId(
                        mainScopeTargetGroupList.brevoId,
                        50,
                        offset,
                        scope,
                    );
                    totalCount = totalContacts;
                    offset += contacts.length;

                    const contactsInContactList: BrevoContactInterface[] = [];
                    const contactsNotInContactList: BrevoContactInterface[] = [];

                    for (const contact of contacts) {
                        const contactIsInTargetGroupByFilters = this.checkIfContactIsInTargetGroupByAttributes(contact.attributes, filters);
                        const manuallyAssignedTargetGroup = targetGroup.assignedContactsTargetGroupBrevoId;
                        const contactIsManuallyAssignedToTargetGroup = manuallyAssignedTargetGroup
                            ? contact.listIds.includes(manuallyAssignedTargetGroup)
                            : false;

                        if (contactIsInTargetGroupByFilters || contactIsManuallyAssignedToTargetGroup) {
                            contactsInContactList.push(contact);
                        } else {
                            contactsNotInContactList.push(contact);
                        }
                    }

                    if (contactsInContactList.length > 0) {
                        await this.brevoApiContactsService.updateMultipleContacts(
                            contactsInContactList.map((contact) => ({ id: contact.id, listIds: [targetGroup.brevoId] })),
                            scope,
                        );
                    }
                    if (contactsNotInContactList.length > 0) {
                        await this.brevoApiContactsService.updateMultipleContacts(
                            contactsNotInContactList.map((contact) => ({ id: contact.id, unlinkListIds: [targetGroup.brevoId] })),
                            scope,
                        );
                    }
                } catch (error) {
                    handleBrevoError(error);
                }
            } while (offset < totalCount);

            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    async findTargetGroups({
        offset,
        limit,
        where,
    }: {
        offset: number;
        limit: number;
        where: FilterQuery<TargetGroupInterface>;
    }): Promise<[TargetGroupInterface[], number]> {
        const [targetGroups, totalContactLists] = await this.repository.findAndCount(where, { offset, limit });

        return [targetGroups, totalContactLists];
    }

    public async createIfNotExistMainTargetGroupForScope(scope: EmailCampaignScopeInterface): Promise<TargetGroupInterface> {
        try {
            const mainList = await this.repository.findOne({ scope, isMainList: true });

            if (mainList) {
                return mainList;
            }

            const title = "Main list for current scope";
            const brevoId = await this.brevoApiContactsService.createBrevoContactList(title, scope);

            if (brevoId) {
                const mainTargetGroupForScope = this.repository.create({ title, brevoId, scope, isMainList: true, isTestList: false });

                await this.entityManager.flush();

                return mainTargetGroupForScope;
            }

            throw new Error("Brevo Error: Could not create contact list");
        } catch (error) {
            handleBrevoError(error);
            throw error;
        }
    }

    public async createIfNotExistTestTargetGroupForScope(scope: EmailCampaignScopeInterface): Promise<TargetGroupInterface> {
        const testList = await this.repository.findOne({ scope, isMainList: false, isTestList: true });

        if (testList) {
            return testList;
        }

        const title = `Test list for scope: ${stringify(scope)}`;

        const brevoId = await this.brevoApiContactsService.createBrevoContactList(title, scope);

        if (brevoId) {
            const testTargetGroupForScope = this.repository.create({ title, brevoId, scope, isMainList: false, isTestList: true });

            await this.entityManager.flush();

            return testTargetGroupForScope;
        }

        throw new Error("Brevo Error: Could not create contact list");
    }

    public async createIfNotExistsManuallyAssignedContactsTargetGroup(targetGroup: TargetGroupInterface) {
        try {
            if (targetGroup.assignedContactsTargetGroupBrevoId) {
                return targetGroup.assignedContactsTargetGroupBrevoId;
            }

            const brevoId = await this.brevoApiContactsService.createBrevoContactList(
                `Manually assigned contacts for target group ${targetGroup.brevoId}`,
                targetGroup.scope,
            );

            if (!brevoId) {
                throw new Error("Brevo Error: Could not create target group in brevo");
            }

            wrap(targetGroup).assign({
                assignedContactsTargetGroupBrevoId: brevoId,
            });

            await this.entityManager.flush();

            return brevoId;
        } catch (error) {
            handleBrevoError(error);
            throw error;
        }
    }
}
