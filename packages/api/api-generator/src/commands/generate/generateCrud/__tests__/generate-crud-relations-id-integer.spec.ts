import { Entity, ManyToOne, OneToMany, PrimaryKey, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityCategoryWithIntegerId extends BaseEntity {
    @PrimaryKey({ columnType: "int", type: "integer" })
    id: number;

    @OneToMany(() => TestEntityProduct, (products) => products.categoryWithInteger)
    products = new Collection<TestEntityProduct>(this);
}

@Entity()
class TestEntityCategoryWithIntId extends BaseEntity {
    @PrimaryKey({ columnType: "int", type: "int" })
    id: number;

    @OneToMany(() => TestEntityProduct, (products) => products.categoryWithInt)
    products = new Collection<TestEntityProduct>(this);
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => TestEntityCategoryWithIntegerId, { nullable: true, ref: true })
    categoryWithInteger?: Ref<TestEntityCategoryWithIntegerId>;

    @ManyToOne(() => TestEntityCategoryWithIntId, { nullable: true, ref: true })
    categoryWithInt?: Ref<TestEntityCategoryWithIntId>;
}

describe("GenerateCrudRelationsIdNumber", () => {
    describe("resolver class", () => {
        it("input type to category relation with primary key type integer should be number with integer validator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategoryWithIntegerId, TestEntityCategoryWithIntId],
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
            expect(structure.properties?.[0].name).toBe("categoryWithInteger");
            expect(structure.properties?.[0].type).toBe("number");
            expect(structure.properties?.[0].decorators?.length).toBe(4);
            const decorators = structure.properties?.[0].decorators?.map((dec) => dec.name);
            expect(decorators).toContain("Transform");
            expect(decorators).toContain("IsInt");
            expect(decorators).not.toContain("IsUUID");
            expect(decorators).not.toContain("IsString");
            await orm.close();
        });

        it("input type to category relation with primary key type int should be number with integer validator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategoryWithIntegerId, TestEntityCategoryWithIntId],
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
            expect(structure.properties?.[1].name).toBe("categoryWithInt");
            expect(structure.properties?.[1].type).toBe("number");
            expect(structure.properties?.[1].decorators?.length).toBe(4);
            const decorators = structure.properties?.[1].decorators?.map((dec) => dec.name);
            expect(decorators).toContain("Transform");
            expect(decorators).toContain("IsInt");
            expect(decorators).not.toContain("IsUUID");
            expect(decorators).not.toContain("IsString");
            await orm.close();
        });
    });
});
