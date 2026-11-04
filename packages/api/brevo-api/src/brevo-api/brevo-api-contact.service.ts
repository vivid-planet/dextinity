import { Brevo } from "@getbrevo/brevo";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "src/types";

import { BlacklistedContactsService } from "../blacklisted-contacts/blacklisted-contacts.service";
import { BrevoContactInterface } from "../brevo-contact/dto/brevo-contact.factory";
import { BrevoEmailImportLogService } from "../brevo-email-import-log/brevo-email-import-log.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { handleBrevoError, isErrorFromBrevo } from "./brevo-api.utils";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiContactList } from "./dto/brevo-api-contact-list";

export interface CreateDoubleOptInContactData {
    email: string;
    attributes?: BrevoContactAttributesInterface;
    redirectionUrl?: string;
}

@Injectable()
export class BrevoApiContactsService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
        private readonly clientFactory: BrevoApiClientFactory,
        @Optional() private readonly blacklistedContactsService: BlacklistedContactsService,
        @Optional() private readonly brevoContactLogService: BrevoEmailImportLogService,
    ) {}

    public async createDoubleOptInBrevoContact(
        { email, redirectionUrl, attributes }: CreateDoubleOptInContactData,
        brevoIds: number[],
        templateId: number,
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        try {
            if (redirectionUrl) {
                await this.clientFactory.getClient(scope).contacts.createDoiContact({
                    email,
                    includeListIds: brevoIds,
                    templateId,
                    redirectionUrl,
                    attributes,
                });

                return true;
            }
            return false;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async createBrevoContactWithoutDoubleOptIn(
        { email, attributes }: Brevo.CreateContactRequest,
        brevoIds: number[],
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        await this.clientFactory.getClient(scope).contacts.createContact({
            email,
            listIds: brevoIds,
            attributes,
        });

        return true;
    }

    public async createTestContact(
        { email, attributes }: Brevo.CreateContactRequest,
        brevoIds: number[],
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        await this.clientFactory.getClient(scope).contacts.createContact({
            email,
            listIds: brevoIds,
            attributes,
        });

        return true;
    }

    public async updateContact(
        id: number,
        {
            blocked,
            attributes,
            listIds,
            unlinkListIds,
        }: { blocked?: boolean; attributes?: BrevoContactAttributesInterface; listIds?: number[]; unlinkListIds?: number[] },
        scope: EmailCampaignScopeInterface,
        sendDoubleOptIn?: boolean,
        responsibleUserId?: string,
        contactSource?: ContactSource,
        importId?: string,
    ): Promise<BrevoContactInterface> {
        try {
            await this.clientFactory
                .getClient(scope)
                .contacts.updateContact({ identifier: id, emailBlacklisted: blocked, attributes, listIds, unlinkListIds });

            const brevoContact = await this.findContact(id, scope);

            if (!brevoContact) {
                throw new Error(`The brevo contact with the id ${id} not found`);
            }

            if (responsibleUserId && !sendDoubleOptIn && brevoContact.email && contactSource) {
                await this.brevoContactLogService.addContactToLogs(brevoContact.email, responsibleUserId, scope, contactSource, importId);
            }

            return brevoContact;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateMultipleContacts(
        contacts: Brevo.UpdateBatchContactsRequest.Contacts.Item[],
        scope: EmailCampaignScopeInterface,
    ): Promise<boolean> {
        try {
            await this.clientFactory.getClient(scope).contacts.updateBatchContacts({ contacts });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteContact(id: number, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const contactsApi = this.clientFactory.getClient(scope).contacts;
            const contact = await contactsApi.getContactInfo({ identifier: id });

            if (contact.email && this.config.contactsWithoutDoi?.allowAddingContactsWithoutDoi) {
                await this.blacklistedContactsService.addBlacklistedContacts([contact.email], scope);
            }

            await contactsApi.deleteContact({ identifier: id });

            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findContact(idOrEmail: string | number, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface | null> {
        try {
            const contact = await this.clientFactory.getClient(scope).contacts.getContactInfo({ identifier: idOrEmail });

            return contact;
        } catch (error) {
            // Brevo returns a 404 error if no contact is found and a 400 error if an invalid email is provided.
            if (isErrorFromBrevo(error) && (error.statusCode === 404 || error.statusCode === 400)) {
                return null;
            }

            handleBrevoError(error);
        }
    }

    public async getContactInfoByEmail(email: string, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface | null> {
        try {
            const contact = await this.clientFactory.getClient(scope).contacts.getContactInfo({ identifier: email });
            if (!contact) {
                return null;
            }
            return contact;
        } catch (error) {
            // Brevo returns a 404 error if no contact is found and a 400 error if an invalid email is provided.
            if (isErrorFromBrevo(error) && (error.statusCode === 404 || error.statusCode === 400)) {
                return null;
            }
            handleBrevoError(error);
        }
    }

    public async findContactsByListId(
        id: number,
        limit: number,
        offset: number,
        scope: EmailCampaignScopeInterface,
    ): Promise<[BrevoContactInterface[], number]> {
        try {
            const data = await this.clientFactory.getClient(scope).contacts.getContactsFromList({ listId: id, limit, offset });

            return [data.contacts, data.count];
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async getContactCountByListId(id: number, scope: EmailCampaignScopeInterface): Promise<number> {
        try {
            const data = await this.clientFactory.getClient(scope).contacts.getContactsFromList({ listId: id });
            return data.count;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findContacts(limit: number, offset: number, scope: EmailCampaignScopeInterface): Promise<BrevoContactInterface[]> {
        try {
            const data = await this.clientFactory.getClient(scope).contacts.getContacts({ limit, offset });

            return data.contacts;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteContacts(contacts: BrevoContactInterface[], scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            const contactsApi = this.clientFactory.getClient(scope).contacts;
            for (const contact of contacts) {
                if (contact.email && this.config.contactsWithoutDoi?.allowAddingContactsWithoutDoi) {
                    await this.blacklistedContactsService.addBlacklistedContacts([contact.email], scope);
                }
                await contactsApi.deleteContact({ identifier: contact.id });
            }
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async blacklistMultipleContacts(emails: string[], scope: EmailCampaignScopeInterface): Promise<void> {
        const blacklistedContacts = emails.map((email) => ({ email, emailBlacklisted: true }));

        await this.clientFactory.getClient(scope).contacts.updateBatchContacts({ contacts: blacklistedContacts });
    }

    public async createBrevoContactList(title: string, scope: EmailCampaignScopeInterface): Promise<number | undefined> {
        const brevoConfig = await this.brevoConfigRepository.findOne({ scope });

        try {
            const data = await this.clientFactory.getClient(scope).contacts.createList({
                name: title,
                folderId: brevoConfig?.folderId ?? 1,
            });
            return data.id;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async updateBrevoContactList(id: number, title: string, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            await this.clientFactory.getClient(scope).contacts.updateList({ listId: id, name: title });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async deleteBrevoContactList(id: number, scope: EmailCampaignScopeInterface): Promise<boolean> {
        try {
            await this.clientFactory.getClient(scope).contacts.deleteList({ listId: id });
            return true;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findBrevoContactListById(id: number, scope: EmailCampaignScopeInterface): Promise<BrevoApiContactList> {
        try {
            const data = await this.clientFactory.getClient(scope).contacts.getList({ listId: id });
            return data;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    public async findBrevoContactListsByIds(ids: number[], scope: EmailCampaignScopeInterface): Promise<BrevoApiContactList[]> {
        try {
            const lists: BrevoApiContactList[] = [];
            for await (const list of this.getBrevoContactListResponses(scope)) {
                if (ids.includes(list.id)) {
                    lists.push(list);
                }
            }
            return lists;
        } catch (error) {
            handleBrevoError(error);
        }
    }

    async *getBrevoContactListResponses(scope: EmailCampaignScopeInterface): AsyncGenerator<BrevoApiContactList, void, undefined> {
        const limit = 50;
        let offset = 0;

        while (true) {
            try {
                const listsResponse = await this.clientFactory.getClient(scope).contacts.getLists({ limit, offset });
                const lists = listsResponse.lists ?? [];

                if (lists.length === 0) {
                    break;
                }
                yield* lists;

                offset += limit;
            } catch (error) {
                handleBrevoError(error);
            }
        }
    }
}
