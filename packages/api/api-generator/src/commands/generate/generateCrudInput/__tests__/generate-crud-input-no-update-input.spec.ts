import { Entity, PrimaryKey, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { describe, expect, it } from "vitest";

import { formatSource, testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string;
}

describe("GenerateCrudInput", () => {
    it("shouldn't generate an update input", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntity],
            }),
        );

        const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntity"), {
            nested: false,
            excludeFields: [],
            generateUpdateInput: false,
        });

        const formattedOut = await formatSource(out[0].content);

        expect(formattedOut).not.toContain("TestEntityUpdateInput");

        await orm.close();
    });
});
