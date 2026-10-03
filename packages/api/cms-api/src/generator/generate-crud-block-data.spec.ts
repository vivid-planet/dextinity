import { BlockDataInterface, RootBlock } from "@comet/blocks-api";
import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage";
import { v4 as uuid } from "uuid";

import { RootBlockType } from "../blocks/root-block-type";
import { DamImageBlock } from "../dam/blocks/dam-image.block";
import { generateCrud } from "./generate-crud";
import { lintGeneratedFiles, parseSource } from "./utils/test-helper";

@Entity()
class TestEntityProduct extends BaseEntity<TestEntityProduct, "id"> {
    @PrimaryKey({ type: "uuid" })
    id: string = uuid();

    @RootBlock(DamImageBlock)
    @Property({ customType: new RootBlockType(DamImageBlock) })
    image: BlockDataInterface;

    @RootBlock(DamImageBlock)
    @Property({ customType: new RootBlockType(DamImageBlock), nullable: true })
    previewImage?: BlockDataInterface;
}

describe("GenerateCrudRelationsNested", () => {
    describe("resolver class", () => {
        it("should generate valid files for nullable block data", async () => {
            LazyMetadataStorage.load();
            const orm = await MikroORM.init(
                defineConfig({
                    dbName: "test-db",
                    entities: [TestEntityProduct],
                }),
            );

            const out = await generateCrud({ targetDirectory: __dirname }, orm.em.getMetadata().get("TestEntityProduct"));
            const lintedOut = await lintGeneratedFiles(out);

            {
                const file = lintedOut.find((file) => file.name === "test-entity-product.resolver.ts");
                if (!file) throw new Error("File not found");
                const source = parseSource(file.content);

                const classes = source.getClasses();
                expect(classes.length).toBe(1);

                const cls = classes[0];
                expect(cls.getName()).toBe("TestEntityProductResolver");
                const structure = cls.getStructure();

                expect(structure.properties?.length).toBe(0);
                expect(structure.methods?.length).toBe(7);

                let methodStatements = structure.methods?.[2].statements;
                if (Array.isArray(methodStatements)) {
                    methodStatements = methodStatements.map((statement) => (typeof statement === "object" ? JSON.stringify(statement) : statement));
                }

                // create
                expect(methodStatements).toContain("previewImage: previewImageInput?.transformToBlockData() ?? previewImageInput");

                // resolve field
                expect(structure.methods?.[6].decorators?.[0].arguments).toBe(["() => RootBlockDataScalar(DamImageBlock)", "{ nullable: true }"]);
                expect(structure.methods?.[6].returnType).toBe("Promise<object | null >");
                expect(structure.methods?.[6].statements).toBe([
                    "return testEntityProduct.previewImage ? this.blocksTransformer.transformToPlain(testEntityProduct.previewImage) : null;",
                ]);
            }

            orm.close();
        });
    });
});
