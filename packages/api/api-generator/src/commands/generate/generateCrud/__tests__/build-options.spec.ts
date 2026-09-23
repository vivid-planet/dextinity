import { Entity, ManyToOne, OneToOne, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { testPermission } from "../../utils/test-helper";
import { buildSortProps } from "../build-options";
import { generateSortDto } from "../generate-crud";

@Entity()
export class TestEntity1 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}

@Entity()
export class TestEntity2 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @ManyToOne(() => TestEntityTarget, { nullable: true, index: true, ref: true })
    nested?: Ref<TestEntityTarget> = undefined;
}

@Entity()
export class TestEntity3 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @OneToOne(() => TestEntityTarget, { nullable: true, index: true, ref: true })
    nested?: Ref<TestEntityTarget> = undefined;
}

@Entity()
export class TestEntityTarget extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}

describe("buildOptions", () => {
    describe("buildSortProps", () => {
        it("string field should be used as sortProp", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntity1],
                }),
            );

            const sortProps = buildSortProps(orm.em.getMetadata().getByClassName("TestEntity1"));
            expect(sortProps).toEqual(["foo", "id"]);

            await orm.close();
        });

        it("nested m:1 relation string field should be used as sortProp", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntity2, TestEntityTarget],
                }),
            );

            const metadata = orm.em.getMetadata().getByClassName("TestEntity2");

            const sortProps = buildSortProps(metadata);
            expect(sortProps).toEqual(["nested", "id", "nested.foo"]);

            const sortDto = generateSortDto({ generatorOptions: { requiredPermission: testPermission }, metadata });
            expect(sortDto).toMatchSnapshot();

            await orm.close();
        });

        it("nested 1:1 relation string field should be used as sortProp", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    metadataProvider: ReflectMetadataProvider,
                    dbName: "test-db",
                    entities: [TestEntity3, TestEntityTarget],
                }),
            );

            const sortProps = buildSortProps(orm.em.getMetadata().getByClassName("TestEntity3"));
            expect(sortProps).toEqual(["id", "nested.foo"]);

            await orm.close();
        });
    });
});
