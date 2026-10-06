import { CrudGenerator, type CrudGeneratorHooksService, type CurrentUser, type MutationError } from "@dextinity/cms-api";
import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { findHooksService } from "../find-hooks-service.js";
import { testPermission } from "../test-helper.js";
import { TestEntity } from "./find-hooks-service/test-entity.entity.js";
import { TestEntityService } from "./find-hooks-service/test-entity.service.js";
import { TestEntity3 } from "./find-hooks-service/test-entity3.entity.js";

export class Test2MutationError implements MutationError {
    code: string;
}

class TestEntity2Service implements CrudGeneratorHooksService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async validateCreateInput(input: any, options: { currentUser: CurrentUser; args: { xxx: string } }): Promise<Test2MutationError[]> {
        return [];
    }
}

@Entity()
@CrudGenerator({
    requiredPermission: testPermission,
    hooksService: TestEntity2Service,
})
export class TestEntity2 extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    foo: string;
}

describe("find-hooks-service", () => {
    it("finds hooks service and defined methods", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntity2],
            }),
        );

        const hooksService = findHooksService({
            generatorOptions: { requiredPermission: testPermission, hooksService: TestEntityService },
            metadata: orm.em.getMetadata().getByClassName("TestEntity2"),
            targetDirectory: __dirname,
        });
        if (!hooksService) {
            throw new Error("hooksService not found");
        }
        expect(hooksService.className).toEqual("TestEntity2Service");
        expect(hooksService.imports).toEqual([
            {
                name: "Test2MutationError",
                importPath: "./find-hooks-service.spec.js",
            },
        ]);
        expect(hooksService.validateCreateInput).toBeDefined();
        expect(hooksService.validateCreateInput?.options).toContain("currentUser");
        expect(hooksService.validateCreateInput?.options).toContain("args");
        expect(hooksService.validateCreateInput?.returnType).toEqual("Test2MutationError");
        expect(hooksService.validateUpdateInput).toBeNull();

        await orm.close();
    });
    it("finds hooks service and imports with error in same file as service", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntity],
            }),
        );

        const hooksService = findHooksService({
            generatorOptions: { requiredPermission: testPermission, hooksService: TestEntityService },
            metadata: orm.em.getMetadata().getByClassName("TestEntity"),
            targetDirectory: __dirname,
        });
        if (!hooksService) {
            throw new Error("hooksService not found");
        }
        expect(hooksService.className).toEqual("TestEntityService");
        expect(hooksService.imports).toEqual([
            {
                name: "TestEntityService",
                importPath: "./find-hooks-service/test-entity.service.js",
            },
            {
                name: "TestMutationError",
                importPath: "./find-hooks-service/test-entity.service.js",
            },
        ]);
        expect(hooksService.validateCreateInput).toBeDefined();
        expect(hooksService.validateCreateInput?.returnType).toEqual("TestMutationError");
        expect(hooksService.validateUpdateInput).toBeNull();

        await orm.close();
    });

    it("finds hooks service and imports with error in other file as service", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                metadataProvider: ReflectMetadataProvider,
                dbName: "test-db",
                entities: [TestEntity3],
            }),
        );

        const hooksService = findHooksService({
            generatorOptions: { requiredPermission: testPermission, hooksService: TestEntityService },
            metadata: orm.em.getMetadata().getByClassName("TestEntity3"),
            targetDirectory: __dirname,
        });
        if (!hooksService) {
            throw new Error("hooksService not found");
        }
        expect(hooksService.className).toEqual("TestEntity3Service");
        expect(hooksService.imports).toEqual([
            {
                name: "TestEntity3Service",
                importPath: "./find-hooks-service/test-entity3.service.js",
            },
            {
                name: "TestEntity3MutationError",
                importPath: "./find-hooks-service/test-entity3-error.js",
            },
        ]);
        expect(hooksService.validateCreateInput).toBeDefined();
        expect(hooksService.validateCreateInput?.returnType).toEqual("TestEntity3MutationError");
        expect(hooksService.validateUpdateInput).toBeNull();

        await orm.close();
    });
});
