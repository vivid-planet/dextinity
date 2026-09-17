import { Entity, Filter, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, testPermission } from "../../utils/test-helper";
import type { GeneratedFile } from "../../utils/write-generated-files";
import { buildOptions } from "../build-options";
import { generateCrud } from "../generate-crud";

@Entity()
@Filter({ name: "deletedAt", cond: { deletedAt: { $ne: null } }, default: true })
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property({ nullable: true, columnType: "timestamp with time zone", onUpdate: () => new Date() })
    deletedAt?: Date;
}

describe("deletedAt soft delete", () => {
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
    });
    afterEach(async () => {
        await orm.close();
    });

    it("should detect deletedAt property", () => {
        const options = buildOptions(orm.em.getMetadata().getByClassName("TestEntity"), { requiredPermission: testPermission });
        expect(options.hasDeletedAtProp).toBe(true);
    });

    it("resolver should contain soft delete logic and not remove logic", async () => {
        const file = formattedOut.find((file) => file.name === "test-entity.resolver.ts");
        if (!file) {
            throw new Error("File not found");
        }

        expect(file.content).toContain("testEntity.assign({ deletedAt: new Date() })");
        expect(file.content).not.toContain("entityManager.remove(testEntity)");
    });
});
