import { BaseEntity, defineConfig, Entity, EntityManager, FullTextType, ManyToOne, MikroORM, PrimaryKey, Property, Ref } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { BlockDataInterface } from "../blocks/block";
import { RootBlockType } from "../blocks/root-block-type";
import { CBlock } from "../blocks/search/test/blocks/A/CBlock";
import { entityToMikroOrmFullText } from "../mikro-orm/helper/entity-to-mikro-orm-full-text";
import { paragraphsForEntity } from "./snippet-source";

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

@Entity({ tableName: "Manufacturer" })
class Manufacturer extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    name!: string;

    @Property({ type: new FullTextType(), nullable: true })
    fullText?: string;
}

@Entity({ tableName: "Article" })
class Article extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    title!: string;

    @Property()
    slug!: string;

    @Property()
    teaser!: string;

    @Property({ type: new RootBlockType(CBlock), nullable: true })
    content!: BlockDataInterface | null;

    @Property({ type: new RootBlockType(CBlock), nullable: true })
    seo!: BlockDataInterface | null;

    @Property<Article>({
        type: new FullTextType(),
        nullable: true,
        onUpdate: (article) =>
            entityToMikroOrmFullText(
                { A: article.title, B: article.teaser, D: article.slug },
                ...[article.seo, article.content].filter((block) => !!block),
            ),
    })
    fullText?: string;
}

@Entity({ tableName: "Product" })
class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    title!: string;

    @Property()
    description!: string;

    @Property()
    teaser!: string;

    @Property({ type: new RootBlockType(CBlock), nullable: true })
    image!: BlockDataInterface | null;

    @ManyToOne(() => Manufacturer)
    manufacturer!: Ref<Manufacturer>;

    @Property<Product>({
        type: new FullTextType(),
        nullable: true,
        onUpdate: (product) => ({ A: product.title, B: product.teaser, D: product.description }),
    })
    fullText?: string;
}

describe("paragraphsForEntity", () => {
    let orm: MikroORM;
    let entityManager: EntityManager;

    beforeAll(async () => {
        orm = await MikroORM.init(defineConfig({ dbName: "test-db", connect: false, entities: [Document, Article, Product, Manufacturer] }));
        entityManager = orm.em.fork();
    });

    afterAll(async () => {
        await orm.close();
    });

    function paragraphs(
        entity: object,
        entityName: string,
        options: { fullTextPropertyName?: string; name?: string; secondaryInformation?: string } = {},
    ) {
        return paragraphsForEntity({
            entity,
            metadata: entityManager.getMetadata().get(entityName),
            fullTextPropertyName: options.fullTextPropertyName,
            name: options.name ?? "",
            secondaryInformation: options.secondaryInformation,
            entityManager,
        });
    }

    it("uses the root blocks in declaration order", async () => {
        const document = Object.assign(new Document(), { seo: cBlockData("seo text"), content: cBlockData("content text") });

        expect(await paragraphs(document, "Document")).toEqual(["content text", "seo text"]);
    });

    it("skips empty root blocks", async () => {
        const document = Object.assign(new Document(), { content: null, seo: cBlockData("seo text") });

        expect(await paragraphs(document, "Document")).toEqual(["seo text"]);
    });

    it("adds the callback texts after the root blocks and leaves out the root block texts the callback appends", async () => {
        const article = Object.assign(new Article(), {
            title: "Fox",
            slug: "fox",
            teaser: "A quick fox",
            content: cBlockData("content text"),
            seo: cBlockData("seo text"),
        });

        expect(await paragraphs(article, "Article", { fullTextPropertyName: "fullText", name: "Fox" })).toEqual([
            "content text",
            "seo text",
            "fox",
            "A quick fox",
        ]);
    });

    it("leaves out texts that equal the name or the secondary information", async () => {
        const article = Object.assign(new Article(), {
            title: "Fox",
            slug: "fox",
            teaser: "A quick fox",
            content: cBlockData("Fox"),
            seo: null,
        });

        expect(await paragraphs(article, "Article", { fullTextPropertyName: "fullText", name: "Fox", secondaryInformation: " fox " })).toEqual([
            "A quick fox",
        ]);
    });

    it("keeps a callback text that only ends with a part of a root block text", async () => {
        const article = Object.assign(new Article(), { title: "Fox", slug: "quickfox", teaser: "", content: cBlockData("fox"), seo: null });

        expect(await paragraphs(article, "Article", { fullTextPropertyName: "fullText", name: "Fox" })).toEqual(["fox", "quickfox"]);
    });

    it("falls back to the full-text callback, orders the weights D to A and drops the name", async () => {
        const product = Object.assign(new Product(), {
            title: "Fox",
            teaser: "A quick fox",
            description: "Jumps over the lazy dog",
            image: cBlockData(""),
        });

        expect(await paragraphs(product, "Product", { fullTextPropertyName: "fullText", name: " Fox " })).toEqual([
            "Jumps over the lazy dog",
            "A quick fox",
        ]);
    });

    it("returns no paragraphs for a relation path or a property without a callback", async () => {
        const product = Object.assign(new Product(), { title: "Fox" });
        const manufacturer = Object.assign(new Manufacturer(), { name: "Acme" });

        expect(await paragraphs(product, "Product", { fullTextPropertyName: "manufacturer.fullText" })).toEqual([]);
        expect(await paragraphs(manufacturer, "Manufacturer", { fullTextPropertyName: "fullText" })).toEqual([]);
        expect(await paragraphs(manufacturer, "Manufacturer")).toEqual([]);
    });

    it("replaces control characters", async () => {
        const document = Object.assign(new Document(), { content: cBlockData("fake \u0002highlight\u0003\u0000 here") });

        expect(await paragraphs(document, "Document")).toEqual(["fake  highlight   here"]);
    });

    it("cuts paragraphs at 10,000 characters", async () => {
        const document = Object.assign(new Document(), { content: cBlockData("a".repeat(10_050)) });

        const [paragraph] = await paragraphs(document, "Document");
        expect(paragraph).toHaveLength(10_000);
    });
});
