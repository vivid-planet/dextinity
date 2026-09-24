import * as csv from "@fast-csv/parse";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, validateSync } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";
import isEqual from "lodash.isequal";
import { Readable } from "stream";

import { BrevoApiContactsService, CreateDoubleOptInContactData } from "../brevo-api/brevo-api-contact.service";
import { BrevoConfigInterface } from "../brevo-config/entities/brevo-config-entity.factory";
import { BrevoContactsService } from "../brevo-contact/brevo-contacts.service";
import { ContactSource } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { TargetGroupsService } from "../target-group/target-groups.service";
import { EmailCampaignScopeInterface } from "../types";

class BasicValidateableRow {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    [key: string]: string | string[];
}

@ObjectType()
export class CsvImportInformation {
    @Field(() => Int)
    created: number;

    @Field(() => Int)
    updated: number;

    @Field(() => Int)
    failed: number;

    @Field(() => Int)
    blacklisted: number;

    @Field(() => [GraphQLJSONObject], { nullable: true })
    failedColumns: Record<string, string>[];

    @Field(() => [GraphQLJSONObject], { nullable: true })
    blacklistedColumns: Record<string, string>[];

    @Field({ nullable: true })
    errorMessage?: string;
}

interface ImportContactsFromCsvParams {
    fileStream: Readable;
    scope: EmailCampaignScopeInterface;
    redirectUrl: string;
    sendDoubleOptIn: boolean;
    targetGroupIds?: string[];
    isAdminImport?: boolean;
    responsibleUserId?: string;
    importId?: string;
}

@Injectable()
export class BrevoContactImportService {
    constructor(
        @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
        private readonly brevoApiContactsService: BrevoApiContactsService,
        private readonly brevoContactsService: BrevoContactsService,
        private readonly targetGroupsService: TargetGroupsService,
        @InjectRepository("BrevoTargetGroup") private readonly targetGroupRepository: EntityRepository<TargetGroupInterface>,
        @InjectRepository("BrevoConfig") private readonly brevoConfigRepository: EntityRepository<BrevoConfigInterface>,
    ) {}

    async importContactsFromCsv({
        fileStream,
        scope,
        redirectUrl,
        sendDoubleOptIn,
        targetGroupIds = [],
        isAdminImport = false,
        responsibleUserId,
        importId,
    }: ImportContactsFromCsvParams): Promise<CsvImportInformation> {
        const failedColumns: Record<string, string>[] = [];
        const blacklistedColumns: Record<string, string>[] = [];

        const targetGroups = await this.targetGroupRepository.find({ id: { $in: targetGroupIds } });
        const contactSource = ContactSource.csvImport;

        for (const targetGroup of targetGroups) {
            if (targetGroup.isMainList) {
                throw new Error("Main lists are not allowed as target groups for import");
            }

            if (!isEqual(targetGroup.scope, scope)) {
                throw new Error("Target group scope does not match the scope of the import file");
            }
        }

        const manuallyAssignedBrevoContacts = await Promise.all(
            targetGroups.map((targetGroup) => {
                return this.targetGroupsService.createIfNotExistsManuallyAssignedContactsTargetGroup(targetGroup);
            }),
        );
        const targetGroupBrevoIds = [...targetGroups.map((targetGroup) => targetGroup.brevoId), ...manuallyAssignedBrevoContacts];

        const rows = fileStream.pipe(csv.parse({ headers: true, delimiter: ";", ignoreEmpty: true })).on("error", (error) => {
            throw error;
        });

        let created = 0;
        let updated = 0;
        let failed = 0;
        let blacklisted = 0;
        for await (const row of rows) {
            // This is a temporary solution. We should handle the import as a background job and allow importing more than 100 contacts
            if (isAdminImport && created + updated + failed + blacklisted > 100) {
                return {
                    created,
                    updated,
                    failed,
                    blacklisted,
                    failedColumns,
                    blacklistedColumns,
                    errorMessage:
                        "Too many contacts. Currently we only support 100 contacts at once, the first 100 contacts were handled. Please split the file and try again with the remaining contacts.",
                };
            }
            try {
                const contactData = await this.processCsvRow(row, redirectUrl);
                const result = await this.createOrUpdateBrevoContact(
                    contactData,
                    scope,
                    targetGroupBrevoIds,
                    sendDoubleOptIn,
                    responsibleUserId,
                    contactSource,
                    importId,
                );
                switch (result) {
                    case "created":
                        created++;
                        break;
                    case "updated":
                        updated++;
                        break;
                    case "blacklisted":
                        blacklistedColumns.push(row);
                        blacklisted++;
                        break;
                    case "error":
                        failedColumns.push(row);
                        failed++;
                        break;
                }
            } catch (validationError) {
                console.error(validationError);
                failedColumns.push(row);
                failed++;
            }
        }
        if (created + updated + failed === 0) {
            return { created, updated, failed, blacklisted, failedColumns, blacklistedColumns, errorMessage: "No contacts found." };
        }

        return { created, updated, failed, blacklisted, failedColumns, blacklistedColumns };
    }

    private async createOrUpdateBrevoContact(
        contact: CreateDoubleOptInContactData,
        scope: EmailCampaignScopeInterface,
        targetGroupBrevoIds: number[],
        sendDoubleOptIn: boolean,
        responsibleUserId?: string,
        contactSource?: ContactSource,
        importId?: string,
    ): Promise<"created" | "updated" | "error" | "blacklisted"> {
        try {
            const brevoContact = await this.brevoApiContactsService.findContact(contact.email, scope);

            const mainTargetGroupForScope = await this.targetGroupsService.createIfNotExistMainTargetGroupForScope(scope);
            if (brevoContact && !brevoContact.emailBlacklisted) {
                const updatedBrevoContact = await this.brevoApiContactsService.updateContact(
                    brevoContact.id,
                    { ...contact, listIds: [mainTargetGroupForScope.brevoId, ...targetGroupBrevoIds, ...brevoContact.listIds] },
                    scope,
                    sendDoubleOptIn,
                    responsibleUserId,
                    contactSource,
                    importId,
                );
                if (updatedBrevoContact) {
                    return "updated";
                }
            } else if (!brevoContact) {
                const brevoConfig = await this.brevoConfigRepository.findOneOrFail({ scope });

                const success = await this.brevoContactsService.createContact({
                    ...contact,
                    scope,
                    templateId: brevoConfig.doubleOptInTemplateId,
                    listIds: [mainTargetGroupForScope.brevoId, ...targetGroupBrevoIds],
                    sendDoubleOptIn,
                    responsibleUserId,
                    contactSource,
                });
                if (!success) {
                    return "blacklisted";
                }
                if (success) {
                    return "created";
                }
            }
        } catch (err) {
            console.error(err);
        }
        return "error";
    }

    private parseValue({ value, key }: { value: string; key: string }): string | string[] {
        if (this.config.brevo.BrevoContactAttributes) {
            const designType = Reflect.getMetadata("design:type", this.config.brevo.BrevoContactAttributes.prototype, key.toUpperCase())?.name;

            if (designType === "Array") {
                return value.trim() === "" ? [] : value.split(",").map((item) => item.trim());
            }
        }

        return value;
    }

    private async processCsvRow(row: Record<string, string>, redirectUrlForImport: string): Promise<CreateDoubleOptInContactData> {
        const mappedRow = this.createValidateableCsvRowClass();

        // Make all keys uppercase because all attributes have to be defined uppercase in brevo
        // Make email lowercase, because that's how brevo expects it
        for (const key in row) {
            if (key.toLowerCase() === "email") {
                mappedRow.email = row[key];
            } else {
                mappedRow[key.toUpperCase()] = this.parseValue({ value: row[key], key });
            }
        }

        const errors = validateSync(mappedRow);

        if (errors.length > 0) {
            throw errors;
        }

        const { email, ...data } = mappedRow;

        return {
            email: mappedRow.email,
            redirectionUrl: redirectUrlForImport,
            attributes: { ...data },
        };
    }

    private createValidateableCsvRowClass(): BasicValidateableRow {
        if (this.config.brevo.BrevoContactAttributes) {
            const BrevoContactAttributesClass = this.config.brevo.BrevoContactAttributes;
            class ValidateableRow extends BrevoContactAttributesClass {
                @IsEmail()
                @IsNotEmpty()
                email: string;
            }

            return new ValidateableRow();
        } else {
            class ValidateableRow extends BasicValidateableRow {}
            return new ValidateableRow();
        }
    }
}
