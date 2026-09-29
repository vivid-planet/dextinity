import { migrationsList as brevoMigrationsList } from "@dextinity/brevo-api";
import { createMigrationsList, createOrmConfig } from "@dextinity/cms-api";
import { DataloaderType, TextType, Type } from "@mikro-orm/core";
import { defineConfig, EntityCaseNamingStrategy } from "@mikro-orm/postgresql";
import path from "path";

export const ormConfig = createOrmConfig(
    defineConfig({
        host: process.env.POSTGRESQL_HOST,
        port: Number(process.env.POSTGRESQL_PORT),
        user: process.env.POSTGRESQL_USER,
        password: Buffer.from(process.env.POSTGRESQL_PWD ?? "", "base64")
            .toString("utf-8")
            .trim(),
        dbName: process.env.POSTGRESQL_DB,
        driverOptions: {
            connection: { ssl: process.env.POSTGRESQL_USE_SSL === "true" },
        },
        namingStrategy: EntityCaseNamingStrategy,
        debug: false,
        connect: process.env.MIKRO_ORM_NO_CONNECT !== "true",
        dataloader: DataloaderType.ALL,
        discovery: {
            getMappedType(type: string, platform) {
                // Map all string types to TEXT instead of VARCHAR
                if (type === "string") {
                    return Type.getType(TextType);
                }
                return platform.getDefaultMappedType(type);
            },
        },
        migrations: {
            tableName: "Migrations",
            //  `path` is only used to tell MikroORM where to place newly generated migrations. Available migrations are defined using `migrationsList`.
            path: "./src/db/migrations",
            migrationsList: [...brevoMigrationsList, ...createMigrationsList(path.resolve(__dirname, "migrations"))],
            disableForeignKeys: false,
            dropTables: false,
            snapshot: false,
        },
    }),
);
