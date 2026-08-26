import { CurrentUser, FileUpload, FileUploadsService, GetCurrentUser, RequiredPermission } from "@dextinity/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Type } from "@nestjs/common";
import { Args, ArgsType, Mutation, Resolver } from "@nestjs/graphql";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";

import { BrevoModuleConfig } from "../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../config/brevo-module.constants";
import { EmailCampaignScopeInterface } from "../types";
import { BrevoContactImportService, CsvImportInformation } from "./brevo-contact-import.service";
import { BrevoContactInterface } from "./dto/brevo-contact.factory";
import { BrevoContactImportArgsFactory } from "./dto/brevo-contact-import.args";

export function createBrevoContactImportResolver({
    Scope,
    BrevoContact,
}: {
    BrevoContact: Type<BrevoContactInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}): Type<unknown> {
    @ArgsType()
    class BrevoContactImportArgs extends BrevoContactImportArgsFactory.create({ Scope }) {}

    @Resolver(() => BrevoContact)
    @RequiredPermission(["brevoNewsletter"], { skipScopeCheck: true })
    class BrevoContactImportResolver {
        constructor(
            @Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig,
            @Inject(BrevoContactImportService) private readonly brevoContactImportService: BrevoContactImportService,
            @InjectRepository(FileUpload) private readonly fileUploadRepository: EntityRepository<FileUpload>,
            private readonly entityManager: EntityManager,
            private readonly fileUploadsService: FileUploadsService,
        ) {}

        @Mutation(() => CsvImportInformation)
        async startBrevoContactImport(
            @Args() { fileId, targetGroupIds, scope, sendDoubleOptIn }: BrevoContactImportArgs,
            @GetCurrentUser() user: CurrentUser,
        ): Promise<CsvImportInformation> {
            const importId: string = uuid();
            const fileUpload = await this.fileUploadRepository.findOne(fileId);

            if (!fileUpload) {
                throw new Error("File not found");
            }

            try {
                const fileContent = await this.fileUploadsService.getFileContent(fileUpload);
                const redirectUrl = this.config.brevo.resolveConfig(scope).redirectUrlForImport;

                const result = await this.brevoContactImportService.importContactsFromCsv({
                    fileStream: Readable.from(fileContent),
                    scope,
                    redirectUrl,
                    targetGroupIds,
                    sendDoubleOptIn,
                    responsibleUserId: user.id,
                    importId,
                });

                await this.fileUploadsService.delete(fileUpload);
                await this.entityManager.flush();

                return result;
            } catch (error) {
                // in case of error always delete the uploaded file
                await this.fileUploadsService.delete(fileUpload);
                await this.entityManager.flush();

                throw error;
            }
        }
    }

    return BrevoContactImportResolver;
}
