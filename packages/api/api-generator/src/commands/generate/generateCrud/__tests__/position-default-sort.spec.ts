import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, testPermission } from "../../utils/test-helper";
import type { GeneratedFile } from "../../utils/write-generated-files";
import { generateCrud } from "../generate-crud";

@Entity()
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ type: "integer" })
    position: number;
}

describe("position default sort", () => {
    describe("filter should include primary key", () => {
        let formattedOut: GeneratedFile[];
        let orm: MikroORM;
        beforeEach(async () => {
            LazyMetadataStorage.load();
            orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntity],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntity"));
            formattedOut = await formatGeneratedFiles(out);
        });
        afterEach(async () => {
            await orm.close();
        });

        it("args dto should have default value for sort", async () => {
            const file = formattedOut.find((file) => file.name === "dto/test-entities.args.ts");
            if (!file) {
                throw new Error("File not found");
            }

            expect(file.content).toMatchSnapshot();
        });
    });
});
