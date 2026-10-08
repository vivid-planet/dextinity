import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { Field, Int } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { generateCrud } from "../../generateCrud/generate-crud";
import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";

@Entity()
class TestEntityWithIntegerTypes extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Field(() => Int)
    @Property({ columnType: "int" })
    int: number;

    @Field(() => Int)
    @Property({ columnType: "integer" })
    integer: number;

    @Field(() => Int)
    @Property({ columnType: "tinyint" })
    tinyint: number;

    @Field(() => Int)
    @Property({ columnType: "smallint" })
    smallint: number;

    @Field(() => Int)
    @Property({ columnType: "mediumint" })
    mediumint: number;

    @Field(() => Int)
    @Property({ columnType: "bigint" })
    bigint: number;

    @Field(() => Int)
    @Property({ columnType: "int2" })
    int2: number;

    @Field(() => Int)
    @Property({ columnType: "int4" })
    int4: number;

    @Field(() => Int)
    @Property({ columnType: "int8" })
    int8: number;

    @Field(() => Int)
    @Property({ columnType: "serial" })
    serial: number;
}

describe("GenerateCrudInputInteger", () => {
    it("should generate correct input type for integer values", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntityWithIntegerTypes],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithIntegerTypes"));
        const formattedOut = await formatGeneratedFiles(out);
        const file = formattedOut.find((file) => file.name === "dto/test-entity-with-integer-types.input.ts");
        if (!file) {
            throw new Error("File not found");
        }
        const source = parseSource(file.content);

        const classes = source.getClasses();
        expect(classes.length).toBe(2);
        {
            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(10);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const prop of structure.properties!) {
                expect(prop.type).toBe("number");
                const decorators = prop.decorators?.map((i) => i.name);
                const fieldDecorator = prop.decorators?.find((i) => i.name === "Field");
                expect(fieldDecorator).not.toBeUndefined();
                if (cls.getName() === "TestEntityWithIntegerTypesInput") {
                    expect(fieldDecorator?.arguments).toContain("() => Int");
                }
                expect(decorators).toContain("IsNotEmpty");
                expect(decorators).toContain("IsInt");
                expect(decorators).not.toContain("IsNumeric");
            }
        }

        await orm.close();
    });
});
