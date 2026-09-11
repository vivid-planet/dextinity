import { MikroOrmModule as MikroOrmNestjsModule, MikroOrmModuleOptions as MikroOrmNestjsOptions } from "@mikro-orm/nestjs";
import { EntityCaseNamingStrategy, MigrationObject, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { DynamicModule, Module } from "@nestjs/common";
import fs from "fs";
import path from "path";

import { Migration20220127085859 } from "./migrations/Migration20220127085859";
import { Migration20220127085946 } from "./migrations/Migration20220127085946";
import { Migration20220127091538 } from "./migrations/Migration20220127091538";
import { Migration20220127091751 } from "./migrations/Migration20220127091751";
import { Migration20220127111301 } from "./migrations/Migration20220127111301";
import { Migration20220127142112 } from "./migrations/Migration20220127142112";
import { Migration20220620124134 } from "./migrations/Migration20220620124134";
import { Migration20220905145606 } from "./migrations/Migration20220905145606";
import { Migration20230209111818 } from "./migrations/Migration20230209111818";
import { Migration20230302145445 } from "./migrations/Migration20230302145445";
import { Migration20230613150332 } from "./migrations/Migration20230613150332";
import { Migration20230802124224 } from "./migrations/Migration20230802124224";
import { Migration20230808085034 } from "./migrations/Migration20230808085034";
import { Migration20230821090303 } from "./migrations/Migration20230821090303";
import { Migration20231204140305 } from "./migrations/Migration20231204140305";
import { Migration20231206123505 } from "./migrations/Migration20231206123505";
import { Migration20231215103630 } from "./migrations/Migration20231215103630";
import { Migration20231218092313 } from "./migrations/Migration20231218092313";
import { Migration20231222090009 } from "./migrations/Migration20231222090009";
import { Migration20240702123233 } from "./migrations/Migration20240702123233";
import { Migration20240725071750 } from "./migrations/Migration20240725071750";
import { Migration20240814090503 } from "./migrations/Migration20240814090503";
import { Migration20240814090541 } from "./migrations/Migration20240814090541";
import { Migration20240814090653 } from "./migrations/Migration20240814090653";
import { Migration20250403134629 } from "./migrations/Migration20250403134629";
import { Migration20250531565156 } from "./migrations/Migration20250531565156";
import { Migration20250531565157 } from "./migrations/Migration20250531565157";
import { Migration20250612134629 } from "./migrations/Migration20250612134629";
import { Migration20250623085054 } from "./migrations/Migration20250623085054";
import { Migration20250623113026 } from "./migrations/Migration20250623113026";
import { Migration20251013081751 } from "./migrations/Migration20251013081751";
import { Migration20251118143418 } from "./migrations/Migration20251118143418";
import { Migration20251126093305 } from "./migrations/Migration20251126093305";
import { Migration20260413072931 } from "./migrations/Migration20260413072931";
import { Migration20260707120000 } from "./migrations/Migration20260707120000";
import { Migration20260715090000 } from "./migrations/Migration20260715090000";
import { Migration20260803090000 } from "./migrations/Migration20260803090000";

export interface MikroOrmModuleOptions {
    ormConfig: MikroOrmNestjsOptions;
}

export function createMigrationsList(migrationsDir: string): MigrationObject[] {
    if (!fs.existsSync(migrationsDir)) {
        return [];
    }

    const files = fs.readdirSync(migrationsDir);

    // We use the file extension to differentiate between the development setup and the production environment. During development migrations are
    // loaded from the source directory (typically `src/`) and have a ".ts" extension. In production migrations are loaded from the output directory
    // (typically `dist/` or `lib/`) and may either have a ".js", a ".js.map" or a ".d.ts" extensions (we are only interested in ".js" files). We
    // therefore assume to be in the development setup when all files in the migration directory have a ".ts" file extension.
    const isInSourceDirectory = files.filter((file) => file != ".snapshot-main.json").every((file) => file.endsWith(".ts"));
    const fileExtension = isInSourceDirectory ? ".ts" : ".js";

    return files
        .filter((file) => file.endsWith(fileExtension))
        .map((file) => {
            const { name } = path.parse(file);

            return {
                name,
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                class: require(`${migrationsDir}/${file}`)[name],
            };
        });
}

export function createOrmConfig({ migrations, ...defaults }: MikroOrmNestjsOptions<PostgreSqlDriver>): MikroOrmNestjsOptions<PostgreSqlDriver> {
    return {
        ...defaults,
        namingStrategy: EntityCaseNamingStrategy,
        migrations: {
            ...migrations,
            migrationsList: [
                { name: "Migration20220127085859", class: Migration20220127085859 },
                { name: "Migration20220127085946", class: Migration20220127085946 },
                { name: "Migration20220127091538", class: Migration20220127091538 },
                { name: "Migration20220127091751", class: Migration20220127091751 },
                { name: "Migration20220127111301", class: Migration20220127111301 },
                { name: "Migration20220127142112", class: Migration20220127142112 },
                { name: "Migration20220620124134", class: Migration20220620124134 },
                { name: "Migration20230302145445", class: Migration20230302145445 },
                { name: "Migration20220905145606", class: Migration20220905145606 },
                { name: "Migration20230209111818", class: Migration20230209111818 },
                { name: "Migration20230613150332", class: Migration20230613150332 },
                { name: "Migration20230802124224", class: Migration20230802124224 },
                { name: "Migration20230808085034", class: Migration20230808085034 },
                { name: "Migration20230821090303", class: Migration20230821090303 },
                { name: "Migration20231206123505", class: Migration20231206123505 },
                { name: "Migration20231215103630", class: Migration20231215103630 },
                { name: "Migration20231222090009", class: Migration20231222090009 },
                { name: "Migration20231204140305", class: Migration20231204140305 },
                { name: "Migration20231218092313", class: Migration20231218092313 },
                { name: "Migration20240702123233", class: Migration20240702123233 },
                { name: "Migration20240725071750", class: Migration20240725071750 },
                { name: "Migration20240814090503", class: Migration20240814090503 },
                { name: "Migration20240814090541", class: Migration20240814090541 },
                { name: "Migration20240814090653", class: Migration20240814090653 },
                { name: "Migration20250403134629", class: Migration20250403134629 },
                { name: "Migration20250612134629", class: Migration20250612134629 },
                { name: "Migration20250623085054", class: Migration20250623085054 },
                { name: "Migration20250623113026", class: Migration20250623113026 },
                { name: "Migration20251118143418", class: Migration20251118143418 },
                { name: "Migration20260707120000", class: Migration20260707120000 },
                { name: "Migration20251013081751", class: Migration20251013081751 },
                { name: "Migration20251126093305", class: Migration20251126093305 },
                { name: "Migration20250531565156", class: Migration20250531565156 },
                { name: "Migration20250531565157", class: Migration20250531565157 },
                { name: "Migration20260413072931", class: Migration20260413072931 },
                { name: "Migration20260715090000", class: Migration20260715090000 },
                { name: "Migration20260803090000", class: Migration20260803090000 },
                ...(migrations?.migrationsList || []),
            ].sort((migrationA, migrationB) => {
                if (migrationA.name < migrationB.name) {
                    return -1;
                } else if (migrationA.name > migrationB.name) {
                    return 1;
                } else {
                    return 0;
                }
            }),
        },
    };
}

@Module({})
export class MikroOrmModule {
    static forRoot({ ormConfig: { autoLoadEntities, ...config } }: MikroOrmModuleOptions): DynamicModule {
        return {
            imports: [
                MikroOrmNestjsModule.forRoot({
                    ...config,
                    autoLoadEntities: autoLoadEntities ?? true,
                }),
            ],
            module: MikroOrmNestjsModule,
            providers: [],
            exports: [],
            global: true,
        };
    }
}
