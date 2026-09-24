import { EntityManager, FilterQuery } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import { CreateWarningsServiceInterface } from "../../warnings/decorators/create-warnings.decorator";
import { WarningData } from "../../warnings/dto/warning-data";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG } from "../dam.constants";
import { FileInterface } from "./entities/file.entity";

@Injectable()
export class FileWarningService implements CreateWarningsServiceInterface<FileInterface> {
    constructor(
        @Inject(DAM_CONFIG) private readonly config: DamConfig,
        private readonly entityManager: EntityManager,
    ) {}

    async *bulkCreateWarnings() {
        const filterQuery: FilterQuery<FileInterface> = [
            {
                altText: null,
            },
        ];

        if (this.config.enableLicenseFeature) {
            const soonToExpireDate = new Date();
            soonToExpireDate.setDate(soonToExpireDate.getDate() + 30);
            filterQuery.push({
                license: {
                    durationTo: {
                        $lt: soonToExpireDate,
                    },
                },
            });
        }

        if (this.config.requireLicense) {
            filterQuery.push({ license: null });
        }

        let files = [];
        let offset = 0;
        const limit = 50;
        do {
            files = await this.entityManager.getRepository<FileInterface>("DamFile").find(
                {
                    $or: filterQuery,
                },
                { limit, offset },
            );

            for (const file of files) {
                const warnings = await this.createWarnings(file);
                yield { warnings, targetId: file.id, scope: file.scope };
            }
            offset += limit;
        } while (files.length > 0);
    }

    async createWarnings(entity: FileInterface) {
        const warnings: WarningData[] = [];

        if (!entity.altText) {
            warnings.push({
                severity: "low",
                message: "missingAltText",
            });
        }

        if (!this.config.enableLicenseFeature) {
            return warnings;
        } // license feature not enabled, no warnings

        if (entity.license?.durationTo) {
            const soonToExpireDate = new Date();
            soonToExpireDate.setDate(soonToExpireDate.getDate() + 30);

            if (entity.license.durationTo < new Date()) {
                warnings.push({
                    severity: "high",
                    message: "fileLicenseExpired",
                });
            } else if (entity.license.durationTo < soonToExpireDate) {
                warnings.push({
                    severity: "medium",
                    message: "fileLicenseSoonToExpire",
                });
            }
        }

        // if license feature is required, check if licenses are set
        if (this.config.requireLicense) {
            const isLicenseMissing = entity.license?.type === undefined;
            if (isLicenseMissing) {
                warnings.push({
                    severity: "high",
                    message: "fileLicenseRequired",
                });
            }
        }

        return warnings;
    }
}
