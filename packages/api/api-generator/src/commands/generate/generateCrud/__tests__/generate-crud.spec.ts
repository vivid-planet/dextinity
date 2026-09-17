import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
export class TestEntityWithString extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ columnType: "text" })
    title: string;
}

@Entity()
export class TestEntityWithNumber extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: number;
}

@Entity()
export class TestEntityWithTextRuntimeType extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ type: "text" })
    title: string;
}

describe("GenerateCrud", () => {
    describe("resolver class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithString],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithString"));
            const lintedOut = await formatGeneratedFiles(out);

            const file = lintedOut.find((file) => file.name === "test-entity-with-string.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("TestEntityWithStringResolver");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(0);
            expect(structure.methods?.length).toBe(5);

            await orm.close();
        });
    });

    describe("string filter", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithString],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithString"));
            const formattedOut = await formatGeneratedFiles(out);

            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-string.filter.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("TestEntityWithStringFilter");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(4);
            if (!structure.properties || !structure.properties[1]) {
                throw new Error("property not found");
            }
            const filterProp = structure.properties[1];
            expect(filterProp.name).toBe("title");
            expect(filterProp.type).toBe("StringFilter");

            await orm.close();
        });
    });

    describe("number filter", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithNumber],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithNumber"));
            const formattedOut = await formatGeneratedFiles(out);

            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-number.filter.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("TestEntityWithNumberFilter");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(4);
            if (!structure.properties || !structure.properties[1]) {
                throw new Error("property not found");
            }
            const filterProp = structure.properties[1];
            expect(filterProp.name).toBe("foo");
            expect(filterProp.type).toBe("NumberFilter");

            await orm.close();
        });
    });

    describe("text type filter", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithTextRuntimeType],
                }),
            );

            const out = await generateCrud(
                { requiredPermission: testPermission },
                orm.em.getMetadata().getByClassName("TestEntityWithTextRuntimeType"),
            );
            const formattedOut = await formatGeneratedFiles(out);
            const file = formattedOut.find((file) => file.name === "dto/test-entity-with-text-runtime-type.filter.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            const cls = classes[0];
            expect(cls.getName()).toBe("TestEntityWithTextRuntimeTypeFilter");
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(4);
            if (!structure.properties || !structure.properties[1]) {
                throw new Error("property not found");
            }
            const filterProp = structure.properties[1];
            expect(filterProp.name).toBe("title");
            expect(filterProp.type).toBe("StringFilter");

            await orm.close();
        });
    });
});
