import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { Field } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity({ abstract: true })
export abstract class TimestampEntity extends BaseEntity {
    @Property({
        columnType: "timestamp with time zone",
    })
    @Field()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date(), columnType: "timestamp with time zone" })
    @Field()
    updatedAt: Date = new Date();
}

@Entity()
export class TestEntityWithTimestamps extends TimestampEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}

describe("GenerateCrudInputExtendEntity", () => {
    it("should include timestamp fields in the generated CRUD files", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntityWithTimestamps, TimestampEntity],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntityWithTimestamps"));
        const formattedOut = await formatGeneratedFiles(out);

        const file = formattedOut.find((file) => file.name === "dto/test-entity-with-timestamps.filter.ts");
        if (!file) {
            throw new Error("File not found");
        }

        const source = parseSource(file.content);

        const classes = source.getClasses();
        expect(classes.length).toBe(1);

        const cls = classes[0];
        expect(cls.getName()).toBe("TestEntityWithTimestampsFilter");

        const structure = cls.getStructure();
        const properties = structure.properties || [];

        const createdAtField = properties.find((prop) => prop.name === "createdAt");
        const updatedAtField = properties.find((prop) => prop.name === "updatedAt");

        expect(createdAtField).toBeDefined();
        expect(createdAtField?.type).toBe("DateTimeFilter");

        expect(updatedAtField).toBeDefined();
        expect(updatedAtField?.type).toBe("DateTimeFilter");

        await orm.close();
    });
});
