import { BaseEntity, Collection, defineConfig, Entity, ManyToOne, MikroORM, OneToMany, PrimaryKey, Property, Ref } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { cp, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Entity()
class TestEntityVariant extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @ManyToOne(() => TestEntityProduct, { ref: true })
    product: Ref<TestEntityProduct>;
}

@Entity()
class TestEntityProduct extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @Property()
    title: string;

    @OneToMany(() => TestEntityVariant, (variant) => variant.product, { orphanRemoval: true })
    variants = new Collection<TestEntityVariant>(this);
}

describe("GenerateCrudRelationsNestedOtherDirectory", () => {
    describe("nested resolver class", () => {
        it("should import entities relative to the generated directory of the parent entity", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    connect: false,
                    entities: [TestEntityProduct, TestEntityVariant],
                }),
            );

            // ts-morph reads the entity source files, so both paths must exist on disk
            const projectDirectory = await mkdtemp(path.join(tmpdir(), "api-generator-"));
            try {
                const productEntityPath = path.join(projectDirectory, "src/products/entities/test-entity-product.entity.ts");
                const variantEntityPath = path.join(projectDirectory, "src/variants/entities/test-entity-variant.entity.ts");
                await cp(__filename, productEntityPath);
                await cp(__filename, variantEntityPath);
                orm.em.getMetadata().get("TestEntityProduct").path = productEntityPath;
                orm.em.getMetadata().get("TestEntityVariant").path = variantEntityPath;

                const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntityProduct"));
                const formattedOut = await formatGeneratedFiles(out);

                const file = formattedOut.find((file) => file.name === "test-entity-variant.resolver.ts");
                if (!file) {
                    throw new Error("File not found");
                }
                const source = parseSource(file.content);

                const importPaths = source.getImportDeclarations().map((importDeclaration) => importDeclaration.getModuleSpecifierValue());
                expect(importPaths).toContain("../../variants/entities/test-entity-variant.entity");
                expect(importPaths).toContain("../entities/test-entity-product.entity");
            } finally {
                await orm.close();
                await rm(projectDirectory, { recursive: true });
            }
        });
    });
});
