import { ScopedEntity } from "@dextinity/cms-api";
import { BaseEntity, defineConfig, Embeddable, Embedded, Entity, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
@ScopedEntity<TestEntityWithScopedEntity>((entity) => {
    return { language: entity.language };
})
export class TestEntityWithScopedEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ columnType: "text" })
    language: string;
}

describe("GenerateCrud with ScopedEntity", () => {
    it("resolver must not have skipScopeCheck", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntityWithScopedEntity],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithScopedEntity"));
        const formattedOut = await formatGeneratedFiles(out);

        {
            const file = formattedOut.find((file) => file.name === "test-entity-with-scoped-entity.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const cls = source.getClassOrThrow("TestEntityWithScopedEntityResolver");
            const requiredPermissionDecorator = cls.getDecorators().find((decorator) => decorator.getName() === "RequiredPermission");
            if (!requiredPermissionDecorator) {
                throw new Error("RequiredPermission decorator not found");
            }
            const args = requiredPermissionDecorator.getArguments();
            expect(args.length).toBe(1); //must not contain a second argument with { skipScopeCheck: true }
        }

        await orm.close();
    });
});

@Embeddable()
export class TestEntityScope {
    @Property({ columnType: "text" })
    language: string;
}

@Entity()
export class TestEntityWithScope extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Embedded(() => TestEntityScope)
    scope: TestEntityScope;
}

describe("GenerateCrud with Scope", () => {
    it("resolver must not have skipScopeCheck", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntityWithScope],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityWithScope"));
        const formattedOut = await formatGeneratedFiles(out);

        {
            const file = formattedOut.find((file) => file.name === "test-entity-with-scope.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            const cls = source.getClassOrThrow("TestEntityWithScopeResolver");
            const requiredPermissionDecorator = cls.getDecorators().find((decorator) => decorator.getName() === "RequiredPermission");
            if (!requiredPermissionDecorator) {
                throw new Error("RequiredPermission decorator not found");
            }
            const args = requiredPermissionDecorator.getArguments();
            expect(args.length).toBe(1); //must not contain a second argument with { skipScopeCheck: true }
        }

        await orm.close();
    });
});
