import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityVariant extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @ManyToOne(() => TestEntityProduct, { ref: true })
    product: Ref<TestEntityProduct>;
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @OneToMany(() => TestEntityVariant, (variant) => variant.product, { orphanRemoval: true })
    variants = new Collection<TestEntityVariant>(this);
}

describe("GenerateCrudRelationsNested", () => {
    describe("resolver class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityVariant],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityProduct"));
            const formattedOut = await formatGeneratedFiles(out);

            {
                const file = formattedOut.find((file) => file.name === "test-entity-product.resolver.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);

                const classes = source.getClasses();
                expect(classes.length).toBe(1);

                const cls = classes[0];
                expect(cls.getName()).toBe("TestEntityProductResolver");
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
                expect(structure.methods?.length).toBe(6);
            }

            {
                const file = formattedOut.find((file) => file.name === "dto/test-entity-product.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);

                const classes = source.getClasses();
                expect(classes.length).toBe(2);

                expect(classes[0].getName()).toBe("TestEntityProductInput");
                expect(classes[1].getName()).toBe("TestEntityProductUpdateInput");

                const structure = classes[0].getStructure();

                expect(structure.properties?.length).toBe(2);
                expect(structure.properties?.[1].type).toBe("TestEntityProductNestedTestEntityVariantInput[]");
            }

            {
                const file = formattedOut.find((file) => file.name === "dto/test-entity-product-nested-test-entity-variant.input.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);

                const classes = source.getClasses();
                expect(classes.length).toBe(1);

                expect(classes[0].getName()).toBe("TestEntityProductNestedTestEntityVariantInput");

                const structure = classes[0].getStructure();

                expect(structure.properties?.length).toBe(1);
            }

            await orm.close();
        });
    });
});
