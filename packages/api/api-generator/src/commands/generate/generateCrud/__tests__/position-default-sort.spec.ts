import { BaseEntity, defineConfig, Entity, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, testPermission } from "../../utils/test-helper";
import type { GeneratedFile } from "../../utils/write-generated-files";
import { generateCrud } from "../generate-crud";

@Entity()
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

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
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntity],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity"));
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
