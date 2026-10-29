import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { v5 } from "uuid";

import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import type { WarningData } from "./dto/warning-data.js";
import type { WarningSourceInfo } from "./dto/warning-source-info.js";
import { Warning } from "./entities/warning.entity.js";

@Injectable()
export class WarningService {
    constructor(private readonly entityManager: EntityManager) {}

    private async saveWarning({
        warning,
        sourceInfo,
        scope,
    }: {
        warning: WarningData;
        sourceInfo: WarningSourceInfo;
        scope?: ContentScope;
    }): Promise<void> {
        const staticNamespace = "4e099212-0341-4bc8-8f4a-1f31c7a639ae";
        const id = v5(`${sourceInfo.rootEntityName}${sourceInfo.targetId};${warning.message}`, staticNamespace);

        await this.entityManager.upsert(
            Warning,
            {
                createdAt: new Date(),
                updatedAt: new Date(),
                id,
                message: warning.message,
                severity: warning.severity,
                sourceInfo,
                scope,
            },
            { onConflictExcludeFields: ["createdAt"] },
        );
    }

    public async saveWarnings({
        warnings,
        sourceInfo,
        scope,
    }: {
        warnings: WarningData[];
        sourceInfo: WarningSourceInfo;
        scope?: ContentScope;
    }): Promise<void> {
        for (const warning of warnings) {
            await this.saveWarning({
                warning,
                sourceInfo,
                scope,
            });
        }
    }
}
