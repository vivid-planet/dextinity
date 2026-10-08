import { Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class ProductVariant extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @ManyToOne(() => ProductData, { ref: true })
    productData: Ref<ProductData>;
}

@Entity()
class ProductData extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToOne(() => Product, { ref: true })
    product: Ref<Product>;

    @OneToMany(() => ProductVariant, (variant) => variant.productData, { orphanRemoval: true })
    variants = new Collection<ProductVariant>(this);
}

@Entity()
class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @OneToOne(() => ProductData, { ref: true })
    data: Ref<ProductData>;
}

describe("generate-crud relations two levels", () => {
    it("should be a valid generated ts file", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [Product, ProductData, ProductVariant],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("Product"));
        const formattedOut = await formatGeneratedFiles(out);

        {
            const file = formattedOut.find((file) => file.name === "product.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("ProductResolver");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(0);
            expect(structure.methods?.length).toBe(6);

            const imports: string[] = [];
            for (const tsImport of source.getImportDeclarations()) {
                for (const namedImport of tsImport.getNamedImports()) {
                    imports.push(namedImport.getNameNode().getText());
                }
            }
            expect(imports).toContain("EntityManager");
        }

        {
            const file = formattedOut.find((file) => file.name === "dto/product.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            expect(classes[0].getName()).toBe("ProductInput");
            expect(classes[1].getName()).toBe("ProductUpdateInput");

            const structure = classes[0].getStructure();

            expect(structure.properties?.length).toBe(2);
            expect(structure.properties?.[1].type).toBe("ProductNestedProductDataInput");

            const imports: Record<string, string> = {};
            for (const tsImport of source.getImportDeclarations()) {
                for (const namedImport of tsImport.getNamedImports()) {
                    imports[namedImport.getNameNode().getText()] = tsImport.getModuleSpecifierValue();
                }
            }
            expect(imports["ProductNestedProductDataInput"]).toBe("./product-nested-product-data.input");
        }

        {
            const file = formattedOut.find((file) => file.name === "dto/product-data-nested-product-variant.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            expect(classes[0].getName()).toBe("ProductDataNestedProductVariantInput");

            const structure = classes[0].getStructure();

            expect(structure.properties?.length).toBe(1);
        }

        {
            const file = formattedOut.find((file) => file.name === "dto/product-data-nested-product-variant.input.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            expect(classes[0].getName()).toBe("ProductDataNestedProductVariantInput");

            const structure = classes[0].getStructure();

            expect(structure.properties?.length).toBe(1);
        }

        await orm.close();
    });
});
