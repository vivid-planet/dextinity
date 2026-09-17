import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { ArrayType, BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { Field } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatSource, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrudInput } from "../generate-crud-input";

@Entity()
export class TestEntityArrayString extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ columnType: "json" })
    @Field(() => [String])
    test1: string[];

    @Property()
    @Field(() => [String])
    test2: string[];

    @Property({ type: "array" })
    @Field(() => [String])
    test3: string[];

    @Property({ type: ArrayType })
    @Field(() => [String])
    test4: string[];

    @Property({ type: "json" })
    @Field(() => [String])
    test5: string[];
}

describe("GenerateCrudInputArray", () => {
    it("should support all string array variants", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntityArrayString],
            }),
        );

        const out = await generateCrudInput({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityArrayString"));
        const formattedOut = await formatSource(out[0].content);
        const source = parseSource(formattedOut);

        const classes = source.getClasses();
        expect(classes.length).toBe(2);

        {
            const cls = classes[0];
            const structure = cls.getStructure();

            expect(structure.properties?.length).toBe(5);
            expect(structure.properties?.[0].name).toBe("test1");
            expect(structure.properties?.[0].type).toBe("string[]");
            expect(structure.properties?.[1].name).toBe("test2");
            expect(structure.properties?.[1].type).toBe("string[]");
            expect(structure.properties?.[2].name).toBe("test3");
            expect(structure.properties?.[2].type).toBe("string[]");
            expect(structure.properties?.[3].name).toBe("test4");
            expect(structure.properties?.[3].type).toBe("string[]");
            expect(structure.properties?.[4].name).toBe("test5");
            expect(structure.properties?.[4].type).toBe("string[]");
        }

        await orm.close();
    });
});
