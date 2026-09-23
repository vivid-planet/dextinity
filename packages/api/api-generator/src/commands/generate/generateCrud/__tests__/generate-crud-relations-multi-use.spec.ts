import { Entity, ManyToOne, OneToMany, PrimaryKey, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntitiyProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToMany(() => TestEntityCategory, (filters) => filters.product1)
    categories1 = new Collection<TestEntityCategory>(this);

    @OneToMany(() => TestEntityCategory, (filters) => filters.product2)
    categories2 = new Collection<TestEntityCategory>(this);
}

@Entity()
class TestEntityCategory extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => TestEntitiyProduct, { nullable: true, ref: true })
    product1?: Ref<TestEntitiyProduct>;

    @ManyToOne(() => TestEntitiyProduct, { nullable: true, ref: true })
    product2?: Ref<TestEntitiyProduct>;
}

const isArrayUnique = (arr: unknown[]) => Array.isArray(arr) && new Set(arr).size === arr.length;

describe("GenerateCrudRelationsMultiUse", () => {
    it("should import a relation reference only once if used multiple times", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntityCategory, TestEntitiyProduct],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntitiyProduct"));
        const formattedOut = await formatGeneratedFiles(out);
        const file = formattedOut.find((file) => file.name === "test-entitiy-product.resolver.ts");
        if (!file) {
            throw new Error("File not found");
        }

        const source = parseSource(file.content);

        const imports: string[] = [];
        for (const importDeclaration of source.getImportDeclarations()) {
            for (const namedImport of importDeclaration.getNamedImports()) {
                imports.push(namedImport.getName());
            }
        }
        expect(isArrayUnique(imports)).toBe(true);

        await orm.close();
    });
});
