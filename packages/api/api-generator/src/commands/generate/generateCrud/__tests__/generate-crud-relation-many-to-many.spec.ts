import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref, types } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { GeneratedFile } from "../../utils/write-generated-files";
import { generateCrud } from "../generate-crud";

@Entity()
export class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToMany(() => ProductToCategory, (productCategory) => productCategory.product, { orphanRemoval: true })
    productCategories = new Collection<ProductToCategory>(this);
}

@Entity()
export class ProductToCategory extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => Product, { deleteRule: "cascade", ref: true })
    product: Ref<Product>;

    @ManyToOne(() => Category, { deleteRule: "cascade", ref: true })
    category: Ref<Category>;

    @Property({ type: types.boolean })
    status: boolean = true;
}

@Entity()
export class Category extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToMany(() => ProductToCategory, (productCategory) => productCategory.category, { orphanRemoval: true })
    productCategories = new Collection<ProductToCategory>(this);
}

describe("GenerateCrud Relation n:m with additional column", () => {
    let file: GeneratedFile;
    let orm: MikroORM;
    beforeEach(async () => {
        LazyMetadataStorage.load();
        orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [Product, ProductToCategory, Category],
            }),
        );

        const out = await generateCrud(
            { requiredPermission: testPermission, create: false, update: true, delete: false },
            orm.em.getMetadata().getByClassName("Product"),
        );
        const formattedOut = await formatGeneratedFiles(out);
        const foundFile = formattedOut.find((file) => file.name === "product.resolver.ts");
        if (!foundFile) {
            throw new Error("File not found");
        }

        file = foundFile;
    });

    afterEach(async () => {
        await orm.close();
    });

    it("should call loadItems on collection", async () => {
        const source = parseSource(file.content);
        const classes = source.getClasses();
        expect(classes.length).toBe(1);

        const cls = source.getClassOrThrow("ProductResolver");
        const updateProductMutation = cls.getInstanceMethodOrThrow("updateProduct");
        const updateProductMutationBodyText = updateProductMutation.getBodyText();
        expect(updateProductMutationBodyText).toContain(`product.productCategories.loadItems()`);
    });
});
