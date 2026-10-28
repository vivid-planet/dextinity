import { EntityManager, type FilterQuery } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";

import type { CreateWarningsServiceInterface } from "../../warnings/decorators/create-warnings.decorator.js";
import type { WarningData } from "../../warnings/dto/warning-data.js";
import type { DamConfig } from "../dam.config.js";
import { DAM_CONFIG } from "../dam.constants.js";
import type { FileInterface } from "./entities/file.entity.js";
import { resolveFileEntity } from "./entities/resolve-dam-entity.js";

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
            files = await this.entityManager.find(
                resolveFileEntity(),
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
