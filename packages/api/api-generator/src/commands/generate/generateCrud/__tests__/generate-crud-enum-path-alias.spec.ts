import { BaseEntity, defineConfig, Entity, Enum, MikroORM, PrimaryKey } from "@mikro-orm/postgresql";
import { Field, registerEnumType } from "@nestjs/graphql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import * as path from "path";
import { afterAll, describe, expect, it, vi } from "vitest";

import { testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

const projectDirectoryPromise = vi.hoisted(async () => {
    const { mkdtemp } = await import("fs/promises");
    const { tmpdir } = await import("os");
    const { join } = await import("path");
    return mkdtemp(join(tmpdir(), "api-generator-"));
});

vi.mock("ts-morph", async (importOriginal) => {
    const tsMorph = await importOriginal<typeof import("ts-morph")>();
    const projectDirectory = await projectDirectoryPromise;
    class Project extends tsMorph.Project {
        constructor(options: ConstructorParameters<typeof tsMorph.Project>[0]) {
            super({ ...options, compilerOptions: { paths: { "@src/*": [`${projectDirectory}/src/*`] } } });
        }
    }
    return { ...tsMorph, Project };
});

enum TestStatus {
    Active = "Active",
    Deleted = "Deleted",
}
registerEnumType(TestStatus, { name: "TestStatus" });

@Entity()
class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    @Field(() => TestStatus)
    @Enum({ items: () => TestStatus })
    status: TestStatus;
}

describe("GenerateCrudEnumPathAlias", () => {
    afterAll(async () => {
        await rm(await projectDirectoryPromise, { recursive: true });
    });

    it("should generate the enum filter next to an enum imported with a path alias", async () => {
        const projectDirectory = await projectDirectoryPromise;
        await mkdir(path.join(projectDirectory, "src/common/enums"), { recursive: true });
        await writeFile(
            path.join(projectDirectory, "src/common/enums/test-status.enum.ts"),
            `export enum TestStatus { Active = "Active", Deleted = "Deleted" }`,
        );
        const entityPath = path.join(projectDirectory, "src/products/entities/test-entity.entity.ts");
        await mkdir(path.dirname(entityPath), { recursive: true });
        await writeFile(
            entityPath,
            `import { TestStatus } from "@src/common/enums/test-status.enum";

            export class TestEntity {
                id: string;
                status: TestStatus;
            }`,
        );

        LazyMetadataStorage.load();
        const orm = await MikroORM.init(defineConfig({ dbName: "test-db", connect: false, entities: [TestEntity] }));
        orm.em.getMetadata().get("TestEntity").path = entityPath;

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity"));

        const enumFilter = out.find((file) => file.name === "dto/test-status.enum-filter.ts");
        expect(enumFilter?.targetDirectory).toBe(path.join(projectDirectory, "src/common/enums/generated"));

        await orm.close();
    });
});
