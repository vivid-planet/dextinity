import { CrudField } from "@dextinity/cms-api";
import { BaseEntity, Collection, defineConfig, Entity, ManyToMany, MikroORM, PrimaryKey } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityCategory extends BaseEntity {
    @PrimaryKey({ columnType: "int", type: "integer" })
    id: number;

    @ManyToMany(() => TestEntityProduct, (product) => product.categories)
    products = new Collection<TestEntityProduct>(this);
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @CrudField({
        resolveField: false,
        search: false,
        filter: false,
        sort: false,
        input: false,
    })
    @ManyToMany(() => TestEntityCategory, (category) => category.products, { owner: true })
    categories = new Collection<TestEntityCategory>(this);
}

describe("GenerateCrudResolveField", () => {
    describe("Resolve field", () => {
        it("should not include categories in resolver", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityProduct, TestEntityCategory],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityProduct"));
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "test-entity-product.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);
            const classes = source.getClasses();
            expect(classes.length).toBe(1);
            const cls = classes[0];

            const structure = cls.getStructure();
            const resolveFieldCategoriesMethod = structure.methods?.find((method) => method.name === "categories");
            expect(resolveFieldCategoriesMethod).toBeUndefined();

            const paginatedQuery = structure.methods?.find((method) => method.name === "testEntityProducts");
            expect(paginatedQuery?.statements?.toString().includes(`populate.push("categories");`)).toBe(false);

            await orm.close();
        });
    });
});
