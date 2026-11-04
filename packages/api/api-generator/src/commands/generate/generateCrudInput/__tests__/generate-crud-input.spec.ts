import { BaseEntity, DateType, defineConfig, Entity, Enum, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

import { formatSource, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
export class TestEntityWithString extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property()
    title: string;
}
@Entity()
export class TestEntityWithDate extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property({ type: DateType })
    foo: Date;
}
@Entity()
export class TestEntityWithBoolean extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property()
    foo: boolean;
}

export enum TestEnumType {
    Foo = "Foo",
    Bar = "Bar",
    Baz = "Baz",
}
registerEnumType(TestEnumType, {
    name: "TestEnumType",
});
@Entity()
@ObjectType()
export class TestEntityWithEnum extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Enum({ items: () => TestEnumType })
    @Field(() => TestEnumType)
    type: TestEnumType;
}

@Entity()
export class TestEntityWithUuid extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property({ type: "uuid" })
    fooId: string;
}

@Entity()
export class TestEntityWithTextRuntimeType extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property({ type: "text" })
    title: string;
}

@Entity()
export class TestEntityWithNullablePropWithInitializer extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property({ type: "text", nullable: true })
    title?: string = undefined;
}

@Entity()
export class TestEntityWithNullablePropWithoutInitializer extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Property({ type: "text", nullable: true })
    title?: string;
}

describe("GenerateCrudInput", () => {
    describe("string input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithString],
                }),
            );

            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithString"));
            //console.log(out);
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            {
                const cls = classes[0];
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(1);
            }
            {
                const cls = classes[1]; //update dto
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
            }

            await orm.close();
        });
    });
    describe("date input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithDate],
                }),
            );
            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithDate"));
            //console.log(out);
            const formattedOut = await formatSource(out[0].content);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("foo");
                expect(prop.type).toBe("string");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsDateString");
                expect(decorators).toContain("IsNotEmpty");
            }

            await orm.close();
        });
    });
    describe("boolean input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithBoolean],
                }),
            );
            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithBoolean"));
            //console.log(out);
            const formattedOut = await formatSource(out[0].content);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("foo");
                expect(prop.type).toBe("boolean");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsBoolean");
                expect(decorators).toContain("IsNotEmpty");
            }

            await orm.close();
        });
    });

    describe("enum input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithEnum],
                }),
            );
            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithEnum"));
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("type");
                expect(prop.type).toBe("TestEnumType");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsEnum");
                expect(decorators).toContain("IsNotEmpty");
            }

            await orm.close();
        });
    });

    describe("uuid input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithUuid],
                }),
            );
            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithUuid"));
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("fooId");
                expect(prop.type).toBe("string");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsUUID");
                expect(decorators).toContain("IsNotEmpty");
            }

            await orm.close();
        });
    });

    describe("text type input class", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithTextRuntimeType],
                }),
            );
            const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithTextRuntimeType"));
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("title");
                expect(prop.type).toBe("string");
                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsString");
                expect(decorators).toContain("IsNotEmpty");
            }

            await orm.close();
        });
    });

    describe("nullable props input class with initializer", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithNullablePropWithInitializer],
                }),
            );
            const out = await generateCrudInput(
                { requiredPermission: testPermission },
                orm.em.getMetadata().get("TestEntityWithNullablePropWithInitializer"),
            );
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("title");
                expect(prop.type).toBe("string");

                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsString");
                expect(decorators).toContain("IsNullable");

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const fieldDecorator = prop.decorators!.find((i) => i.name === "Field")!;
                const fieldDecoratorArguments = fieldDecorator.arguments as string[];
                expect(fieldDecoratorArguments[0]).toContain("nullable: true");
                expect(fieldDecoratorArguments[0]).toContain("defaultValue: null");
            }

            await orm.close();
        });
    });

    describe("nullable props input class without initializer", () => {
        it("should be a valid generated ts file", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityWithNullablePropWithoutInitializer],
                }),
            );
            const out = await generateCrudInput(
                { requiredPermission: testPermission },
                orm.em.getMetadata().get("TestEntityWithNullablePropWithoutInitializer"),
            );
            const formattedOut = await formatSource(out[0].content);
            //console.log(formattedOut);
            const source = parseSource(formattedOut);

            const classes = source.getClasses();
            expect(classes.length).toBe(2);

            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(1);
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = structure.properties![0];
                expect(prop.name).toBe("title");
                expect(prop.type).toBe("string");

                const decorators = prop.decorators?.map((i) => i.name);
                expect(decorators).toContain("Field");
                expect(decorators).toContain("IsString");
                expect(decorators).toContain("IsNullable");

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const fieldDecorator = prop.decorators!.find((i) => i.name === "Field")!;
                const fieldDecoratorArguments = fieldDecorator.arguments as string[];
                expect(fieldDecoratorArguments[0]).toContain("nullable: true");
                expect(fieldDecoratorArguments[0]).toContain("defaultValue: null");
            }

            await orm.close();
        });
    });
});
