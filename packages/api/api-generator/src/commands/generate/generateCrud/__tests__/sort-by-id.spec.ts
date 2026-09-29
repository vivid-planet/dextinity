import { CrudField } from "@dextinity/cms-api";
import { BaseEntity, defineConfig, Entity, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, testPermission } from "../../utils/test-helper";
import { buildSortProps } from "../build-options";
import { generateCrud } from "../generate-crud";

@Entity()
export class TestEntity1 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();
}

@Entity()
export class TestEntity2 extends BaseEntity {
    @PrimaryKey({ columnType: "uuid" })
    id: string = uuid();
}

@Entity()
export class TestEntity3 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    @CrudField({
        sort: false,
    })
    id: string = uuid();

    @Property()
    name: string;
}
describe("sort by id", () => {
    it("id should always be sortField", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntity1],
            }),
        );

        const sortProps = buildSortProps(orm.em.getMetadata().get("TestEntity1"));
        expect(sortProps).toEqual(["id"]);

        await orm.close();
    });

    it("id should be sortField when using columnType", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntity2],
            }),
        );

        const sortProps = buildSortProps(orm.em.getMetadata().get("TestEntity2"));
        expect(sortProps).toEqual(["id"]);
        await orm.close();
    });

    it("id not be default value if sort is disabled", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntity3],
            }),
        );

        const sortProps = buildSortProps(orm.em.getMetadata().get("TestEntity3"));
        expect(sortProps).toEqual(["name"]);

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity3"));
        const formattedOut = await formatGeneratedFiles(out);

        const file = formattedOut.find((file) => file.name === "dto/test-entity3s.args.ts");
        if (!file) {
            throw new Error("File not found");
        }

        expect(file.content).toMatchSnapshot();
        await orm.close();
    });
});
