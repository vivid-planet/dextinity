import { Entity, ManyToOne, OneToMany, PrimaryKey, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, Collection, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityCategoryWithStringId extends BaseEntity {
    @PrimaryKey({ columnType: "text", type: "string" })
    id: string;

    @OneToMany(() => TestEntityProduct, (products) => products.category)
    products = new Collection<TestEntityProduct>(this);
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => TestEntityCategoryWithStringId, { nullable: true, ref: true })
    category?: Ref<TestEntityCategoryWithStringId>;
}

describe("GenerateCrudRelationsIdString", () => {
    describe("resolver class", () => {
        it("input type to category relation should be string with isString and not IsUuid validator", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityProduct, TestEntityCategoryWithStringId],
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
            expect(structure.properties?.length).toBe(1);
            expect(structure.properties?.[0].name).toBe("category");
            expect(structure.properties?.[0].type).toBe("string");
            expect(structure.properties?.[0].decorators?.length).toBe(3);
            const decorators = structure.properties?.[0].decorators?.map((dec) => dec.name);
            expect(decorators).toContain("IsString");
            expect(decorators).not.toContain("IsUUID");

            await orm.close();
        });
    });
});
