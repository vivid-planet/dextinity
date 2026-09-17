import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { InputType } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatSource, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
export class TestEntityWithJsonLiteralArray extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ type: "json" })
    foo: string[] = [];

    @Property({ type: "json", nullable: true })
    bar?: number[] = [];
}

@InputType()
export class NestedObject {
    test: string;
}

@Entity()
export class TestEntityWithJsonObject extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ type: "json" })
    foo: NestedObject;

    @Property({ type: "json" })
    bar: NestedObject[];
}

@Entity()
export class TestEntityWithRecord extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ type: "json" })
    foo: Record<string, string>;
}
describe("GenerateCrudInputJson", () => {
    describe("input class literal array", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithJsonLiteralArray],
                }),
            );

            const out = await generateCrudInput(
                { requiredPermission: testPermission },
                orm.em.getMetadata().getByClassName("TestEntityWithJsonLiteralArray"),
            );
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            {
                const cls = classes[0];
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(2);
                expect(structure.properties?.[0].name).toBe("foo");
                expect(structure.properties?.[0].hasQuestionToken).toBe(false);
                expect(structure.properties?.[0].type).toBe("string[]");
                expect(structure.properties?.[1].name).toBe("bar");
                expect(structure.properties?.[1].type).toBe("number[]");
                expect(structure.properties?.[1].hasQuestionToken).toBe(true);
            }
            {
                const cls = classes[1]; //update dto
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
            }

            await orm.close();
        });
    });
    describe("input class json object", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithJsonObject],
                }),
            );

            const out = await generateCrudInput(
                { requiredPermission: testPermission },
                orm.em.getMetadata().getByClassName("TestEntityWithJsonObject"),
            );
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            {
                const cls = classes[0];
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(2);
                expect(structure.properties?.[0].name).toBe("foo");
                expect(structure.properties?.[0].type).toBe("NestedObject");
                expect(structure.properties?.[1].name).toBe("bar");
                expect(structure.properties?.[1].type).toBe("NestedObject[]");
            }
            {
                const cls = classes[1]; //update dto
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
            }

            await orm.close();
        });
    });

    describe("input class record", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntityWithRecord],
                }),
            );

            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithRecord"));
            const formattedOut = await formatSource(out[0].content);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            {
                const cls = classes[0];
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(1);
                expect(structure.properties?.[0].name).toBe("foo");
                expect(structure.properties?.[0].type).toBe("Record<string, string>");
                expect(structure.properties?.[0].decorators?.[0].name).toBe("IsNotEmpty");
                expect(structure.properties?.[0].decorators?.[1].name).toBe("Field");
                expect(structure.properties?.[0].decorators?.[1].arguments).toStrictEqual(["() => GraphQLJSONObject"]);
            }
            {
                const cls = classes[1]; //update dto
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
            }

            await orm.close();
        });
    });
});
