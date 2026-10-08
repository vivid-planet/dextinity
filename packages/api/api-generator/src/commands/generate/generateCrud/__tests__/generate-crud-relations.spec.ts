import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityCategory extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @OneToMany(() => TestEntityProduct, (products) => products.category)
    /*
    @CrudRelationField({
        paging: true,
        filter: true,
        sort: true,
        mutations: true
    })
    */
    products = new Collection<TestEntityProduct>(this);
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @ManyToOne(() => TestEntityCategory, { nullable: true, ref: true })
    /*
    @CrudField({
        search: true,
        filter: true,
        sort: true,
        input: true,
    })
    */
    category?: Ref<TestEntityCategory>;
}

describe("GenerateCrudRelations", () => {
    describe("resolver class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategory],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityProduct"));
            const formattedOut = await formatGeneratedFiles(out);
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

            await orm.close();
        });

        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategory],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityCategory"));
            const formattedOut = await formatGeneratedFiles(out);

            const file = formattedOut.find((file) => file.name === "test-entity-category.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);
            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("TestEntityCategoryResolver");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(0);
            expect(structure.methods?.length).toBe(6);

            await orm.close();
        });

        it("input type to category relation should be string with uuid validator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategory],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityProduct"));
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "dto/test-entity-product.input.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);
            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();
            expect(structure.properties?.length).toBe(2);
            expect(structure.properties?.[1].name).toBe("category");
            expect(structure.properties?.[1].type).toBe("string");
            expect(structure.properties?.[1].decorators?.length).toBe(3);
            const decorators = structure.properties?.[1].decorators?.map((dec) => dec.name);
            expect(decorators).toContain("IsUUID");
            expect(decorators).not.toContain("IsInt");
            expect(decorators).not.toContain("IsString");

            await orm.close();
        });
    });
});
