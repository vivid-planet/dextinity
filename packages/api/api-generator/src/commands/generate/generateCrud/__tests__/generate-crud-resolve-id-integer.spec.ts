import { BaseEntity, defineConfig, Entity, MikroORM, PrimaryKey } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityWithIntegerId extends BaseEntity {
    @PrimaryKey({ columnType: "int", type: "integer" })
    id: number;
}

describe("GenerateCrudResolveIdInteger", () => {
    it("should generate item resolver with correctly typed id parameter", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntityWithIntegerId],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithIntegerId"));
        const formattedOut = await formatGeneratedFiles(out);
        const file = formattedOut.find((file) => file.name === "test-entity-with-integer-id.resolver.ts");
        if (!file) {
            throw new Error("File not found");
        }
        const source = parseSource(file.content);

        const classes = source.getClasses();
        expect(classes.length).toBe(1);
        const cls = classes[0];
        const structure = cls.getStructure();

        const singleItemMethod = structure.methods?.find((method) => method.name === "testEntityWithIntegerId");
        expect(!!singleItemMethod).toBe(true);
        expect(singleItemMethod?.parameters?.length).toBe(1);
        expect(singleItemMethod?.parameters?.[0].name).toBe("id");
        expect(singleItemMethod?.parameters?.[0].type).toBe("number");

        const updateMethod = structure.methods?.find((method) => method.name === "updateTestEntityWithIntegerId");
        expect(!!updateMethod).toBe(true);
        expect(updateMethod?.parameters?.length).toBe(2);
        expect(updateMethod?.parameters?.[0].name).toBe("id");
        expect(updateMethod?.parameters?.[0].type).toBe("number");

        const deleteMethod = structure.methods?.find((method) => method.name === "deleteTestEntityWithIntegerId");
        expect(!!deleteMethod).toBe(true);
        expect(deleteMethod?.parameters?.length).toBe(1);
        expect(deleteMethod?.parameters?.[0].name).toBe("id");
        expect(deleteMethod?.parameters?.[0].type).toBe("number");

        await orm.close();
    });
});
