import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { Field, Float, Int } from "@nestjs/graphql";
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
    @Property({ type: "integer" })
    int1: number;

    @Field(() => Int)
    @Property({ type: "integer", columnType: "int" })
    int2: number;

    @Field(() => Int)
    @Property({ columnType: "int" })
    int3: number;

    @Field(() => String)
    @Property({ type: "string" })
    string1: string;

    @Field(() => String)
    @Property({ type: "string", columnType: "varchar(500)" })
    string2: string;

    @Field(() => String)
    @Property({ columnType: "varchar(500)" })
    string3: string;

    @Field(() => Float)
    @Property({ type: "float" })
    float1: number;

    @Field(() => Boolean)
    @Property({ type: "boolean" })
    boolean1: boolean;
}

describe("GenerateCrudInputTypeOrColumnType", () => {
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
        const cls = classes[0];
        expect(cls.getText()).toMatchSnapshot();

        await orm.close();
    });
});
