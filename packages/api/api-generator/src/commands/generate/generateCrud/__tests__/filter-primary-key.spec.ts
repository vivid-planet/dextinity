import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import type { GeneratedFile } from "../../utils/write-generated-files";
import { generateCrud } from "../generate-crud";

@Entity()
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}

describe("filter primary key", () => {
    describe("filter should include primary key", () => {
        let formattedOut: GeneratedFile[];
        let orm: MikroORM;
        beforeEach(async () => {
            LazyMetadataStorage.load();
            orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntity],
                }),
            );

            const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().getByClassName("TestEntity"));
            formattedOut = await formatGeneratedFiles(out);
            const foundFile = formattedOut.find((file) => file.name === "test-entity.resolver.ts");
            if (!foundFile) {
                throw new Error("File not found");
            }
        });
        afterEach(async () => {
            await orm.close();
        });

        it("filter for embedded field should exist", async () => {
            const file = formattedOut.find((file) => file.name === "dto/test-entity.filter.ts");
            if (!file) {
                throw new Error("File not found");
            }

            const source = parseSource(file.content);

            const classes = source.getClasses();
            expect(classes.length).toBe(1);

            {
                const cls = classes[0];
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(4);
                expect(structure.properties?.[0].name).toBe("id");
                expect(structure.properties?.[0].type).toBe("IdFilter");
                expect(structure.properties?.[1].name).toBe("foo");
                expect(structure.properties?.[1].type).toBe("StringFilter");
                expect(structure.properties?.[2].name).toBe("and");
                expect(structure.properties?.[2].type).toBe("TestEntityFilter[]");
                expect(structure.properties?.[3].name).toBe("or");
                expect(structure.properties?.[3].type).toBe("TestEntityFilter[]");
            }
        });
    });
});
