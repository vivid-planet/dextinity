import { BaseEntity, defineConfig, Entity, Enum, MikroORM, PrimaryKey } from "@mikro-orm/postgresql";
import { Field, registerEnumType } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

export enum TestEnum {
    AND = "AND",
    OR = "OR",
}
registerEnumType(TestEnum, {
    name: "TestEnumOperator",
});

@Entity()
class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Field(() => TestEnum, { nullable: true })
    @Enum({ items: () => TestEnum, nullable: true })
    foo?: TestEnum;
}

describe("GenerateCrudEnumOptional", () => {
    it("should correctly determine enum import path", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntity],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity"));
        const formattedOut = await formatGeneratedFiles(out);
        const file = formattedOut.find((file) => file.name === "dto/test-entity.input.ts");
        if (!file) {
            throw new Error("File not found");
        }
        const source = parseSource(file.content);

        const classes = source.getClasses();
        expect(classes.length).toBe(2);

        const cls = classes[0];
        const structure = cls.getStructure();
        expect(structure.properties?.length).toBe(1);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const prop = structure.properties![0];
        expect(prop.name).toBe("foo");
        expect(prop.type).toBe("TestEnum");
        const decorators = prop.decorators?.map((i) => i.name);
        expect(decorators).toContain("Field");
        expect(decorators).toContain("IsEnum");
        expect(decorators).toContain("IsNullable");

        await orm.close();
    });
});
