import { BaseEntity, defineConfig, Entity, Filter, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { randomUUID } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatGeneratedFiles, testPermission } from "../../utils/test-helper";
import type { GeneratedFile } from "../../utils/write-generated-files";
import { buildOptions } from "../build-options";
import { generateCrud } from "../generate-crud";

@Entity()
@Filter({ name: "deletedAt", cond: { deletedAt: { $ne: null } }, default: true })
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

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
                dbName: "test-db",
                connect: false,
                entities: [TestEntity],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity"));
        formattedOut = await formatGeneratedFiles(out);
    });
    afterEach(async () => {
        await orm.close();
    });

    it("should detect deletedAt property", () => {
        const options = buildOptions(orm.em.getMetadata().get("TestEntity"), { requiredPermission: testPermission });
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
