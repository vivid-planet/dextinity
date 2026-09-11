import { CrudField } from "@dextinity/cms-api";
import { BaseEntity, defineConfig, Embeddable, Embedded, Entity, MikroORM, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { v4 as uuid } from "uuid";
import { describe, expect, it } from "vitest";

import { formatGeneratedFiles, parseSource, testPermission } from "../../utils/test-helper";
import { generateCrud } from "../generate-crud";

@Embeddable()
export class TestEntityScope {
    @Property({ columnType: "text" })
    language: string;
}

@Entity()
export class TestEntity extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    @CrudField({ filter: false, search: false })
    id: string = uuid();

    @Embedded(() => TestEntityScope)
    scope: TestEntityScope;
}

describe("GenerateCrud without find condition", () => {
    it("where should be typed as ObjectQuery as it is when findCondition is used", async () => {
        LazyMetadataStorage.load();
        const orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [TestEntity, TestEntityScope],
            }),
        );

        const out = await generateCrud({ requiredPermission: testPermission }, orm.em.getMetadata().get("TestEntity"));
        const formattedOut = await formatGeneratedFiles(out);

        {
            const file = formattedOut.find((file) => file.name === "test-entity.resolver.ts");
            if (!file) {
                throw new Error("File not found");
            }
            const source = parseSource(file.content);

            expect(
                source
                    .getImportDeclarations()
                    .filter((imp) => imp.getModuleSpecifierValue() === "@mikro-orm/postgresql")
                    .map((imp) => imp.getNamedImports().map((namedImp) => namedImp.getText()))
                    .flat(),
            ).toContain("ObjectQuery");

            const cls = source.getClassOrThrow("TestEntityResolver");
            const testEntitiesQuery = cls.getInstanceMethodOrThrow("testEntities");
            const bodyText = testEntitiesQuery.getBodyText();
            expect(bodyText).toContain("const where: ObjectQuery<TestEntity> = {};");
        }

        await orm.close();
    });
});
