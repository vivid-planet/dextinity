import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { BaseEntity, defineConfig, FullTextType, MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { BlockDataInterface } from "../blocks/block.js";
import { RootBlockType } from "../blocks/root-block-type.js";
import { CBlock } from "../blocks/search/test/blocks/A/CBlock.js";
import { documentSourceText, entitySourceText } from "./snippet-source.js";

function cBlockData(titleC: string): BlockDataInterface {
    return CBlock.blockInputFactory({ titleC }).transformToBlockData();
}

@Entity({ tableName: "Document" })
class Document extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property({ type: new RootBlockType(CBlock), nullable: true })
    content!: BlockDataInterface | null;

    @Property({ type: new RootBlockType(CBlock), nullable: true })
    seo!: BlockDataInterface | null;
}

@Entity({ tableName: "Product" })
class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    title!: string;

    @Property()
    slug!: string;

    @Property()
    material!: string;

    @Property()
    description!: string;

    @Property<Product>({
        type: new FullTextType(),
        nullable: true,
        onUpdate: (product) => ({ D: product.description, C: product.slug, B: product.material, A: product.title }),
    })
    fullText?: string;

    @Property({ type: new FullTextType(), nullable: true })
    fullTextWithoutCallback?: string;
}

describe("snippet source", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        orm = await MikroORM.init(defineConfig({ metadataProvider: ReflectMetadataProvider, dbName: "test-db", entities: [Document, Product] }));
    });

    afterAll(async () => {
        await orm.close();
    });

    function productSourceText(product: Product, fullTextPropertyName: string) {
        const entityManager = orm.em.fork();
        return entitySourceText({
            entity: product,
            metadata: entityManager.getMetadata().get(Product),
            fullTextPropertyName,
            textsShownInResult: ["Cap", "cap"],
            entityManager,
        });
    }

    it("joins the texts of the root blocks of a document and replaces control characters", () => {
        const document = Object.assign(new Document(), { content: cBlockData("Fake \u0002highlight\u0003"), seo: cBlockData("SEO text") });

        expect(documentSourceText(document, orm.getMetadata().get(Document))).toBe("Fake  highlight  SEO text");
    });

    it("joins the weighted texts of the full-text callback from A to D, without the texts shown in the result", async () => {
        const product = Object.assign(new Product(), { title: "Cap", slug: "cap", material: "Cotton", description: "An absorbent cotton cap." });

        expect(await productSourceText(product, "fullText")).toBe("Cotton An absorbent cotton cap.");
    });

    it("returns no text for a property without a callback or a relation path", async () => {
        const product = Object.assign(new Product(), { title: "Cap", description: "An absorbent cotton cap." });

        expect(await productSourceText(product, "fullTextWithoutCallback")).toBe("");
        expect(await productSourceText(product, "manufacturer.fullText")).toBe("");
    });
});
