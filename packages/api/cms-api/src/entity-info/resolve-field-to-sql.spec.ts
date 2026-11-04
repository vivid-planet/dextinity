import {
    BaseEntity,
    Collection,
    defineConfig,
    Embeddable,
    Embedded,
    Entity,
    ManyToOne,
    MikroORM,
    OneToMany,
    OneToOne,
    PrimaryKey,
    Property,
    Ref,
} from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { resolveFieldToSql } from "./resolve-field-to-sql";

// ProductVariant --m:1--> Product --m:1--> Manufacturer (has @Embedded AddressAsEmbeddable)
// AddressAsEmbeddable has @Embedded AlternativeAddressAsEmbeddable

@Embeddable()
class AlternativeAddressAsEmbeddable {
    @Property()
    street!: string;

    @Property()
    zip!: string;
}

@Embeddable()
class AddressAsEmbeddable {
    @Property()
    street!: string;

    @Property()
    zip!: string;

    @Embedded(() => AlternativeAddressAsEmbeddable)
    alternativeAddress!: AlternativeAddressAsEmbeddable;
}

@Entity({ tableName: "Manufacturer" })
class Manufacturer extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    name!: string;

    @Embedded(() => AddressAsEmbeddable)
    addressAsEmbeddable!: AddressAsEmbeddable;
}

@Entity({ tableName: "Product" })
class Product extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    name!: string;

    @Property({ fieldName: "url_slug" })
    slug!: string;

    @ManyToOne(() => Manufacturer)
    manufacturer!: Ref<Manufacturer>;
}

@Entity({ tableName: "Category" })
class Category extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    title!: string;

    @OneToOne(() => Category, { nullable: true })
    parent?: Ref<Category>;
}

// Tag is defined before ProductVariant so Collection<Tag> works in ProductVariant
@Entity({ tableName: "Tag" })
class Tag extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @ManyToOne(() => ProductVariant)
    productVariant!: Ref<ProductVariant>;
}

@Entity({ tableName: "ProductVariant" })
class ProductVariant extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    id!: string;

    @Property()
    name!: string;

    @ManyToOne(() => Product)
    product!: Ref<Product>;

    @OneToOne(() => Category)
    category!: Ref<Category>;

    @OneToMany(() => Tag, (tag) => tag.productVariant)
    tags = new Collection<Tag>(this);
}

describe("resolveFieldToSql", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        orm = await MikroORM.init(
            defineConfig({
                dbName: "test-db",
                connect: false,
                entities: [ProductVariant, Product, Manufacturer, Category, Tag, AddressAsEmbeddable, AlternativeAddressAsEmbeddable],
            }),
        );
    });

    afterAll(async () => {
        await orm.close();
    });

    function callResolveFieldToSql(fieldPath: string, entityName: string): string {
        const metadata = orm.em.getMetadata().get(entityName);
        return resolveFieldToSql(fieldPath, metadata, metadata.tableName);
    }

    describe("direct fields", () => {
        it("resolves a simple field to its column name", () => {
            expect(callResolveFieldToSql("name", "ProductVariant")).toBe('"ProductVariant"."name"');
        });

        it("resolves a field with a different column name", () => {
            expect(callResolveFieldToSql("slug", "Product")).toBe('"Product"."url_slug"');
        });

        it("throws for a non-existent field", () => {
            expect(() => callResolveFieldToSql("nonExistent", "ProductVariant")).toThrow('Field "nonExistent" not found in entity "ProductVariant"');
        });
    });

    describe("ManyToOne relations", () => {
        it("resolves a single-level ManyToOne relation", () => {
            expect(callResolveFieldToSql("product.name", "ProductVariant")).toBe(
                '(SELECT "Product"."name" FROM "Product" WHERE "Product"."id" = "ProductVariant"."product_id")',
            );
        });

        it("resolves a two-level ManyToOne relation chain", () => {
            expect(callResolveFieldToSql("product.manufacturer.name", "ProductVariant")).toBe(
                '(SELECT (SELECT "Manufacturer"."name" FROM "Manufacturer" WHERE "Manufacturer"."id" = "Product"."manufacturer_id") FROM "Product" WHERE "Product"."id" = "ProductVariant"."product_id")',
            );
        });
    });

    describe("OneToOne relations", () => {
        it("resolves a single-level OneToOne relation", () => {
            expect(callResolveFieldToSql("category.title", "ProductVariant")).toBe(
                '(SELECT "Category"."title" FROM "Category" WHERE "Category"."id" = "ProductVariant"."category_id")',
            );
        });

        it("resolves a self-referencing OneToOne relation (n-level)", () => {
            expect(callResolveFieldToSql("category.parent.title", "ProductVariant")).toBe(
                '(SELECT (SELECT "Category"."title" FROM "Category" WHERE "Category"."id" = "Category"."parent_id") FROM "Category" WHERE "Category"."id" = "ProductVariant"."category_id")',
            );
        });
    });

    describe("embeddables", () => {
        it("resolves a field in an embeddable", () => {
            expect(callResolveFieldToSql("addressAsEmbeddable.street", "Manufacturer")).toBe('"Manufacturer"."address_as_embeddable_street"');
        });

        it("resolves a field in a nested embeddable", () => {
            expect(callResolveFieldToSql("addressAsEmbeddable.alternativeAddress.street", "Manufacturer")).toBe(
                '"Manufacturer"."address_as_embeddable_alternative_address_street"',
            );
        });

        it("throws for a non-existent field in an embeddable", () => {
            expect(() => callResolveFieldToSql("addressAsEmbeddable.nonExistent", "Manufacturer")).toThrow(
                'Embedded field "nonExistent" not found in embeddable "addressAsEmbeddable" of entity "Manufacturer"',
            );
        });

        it("throws for a non-existent field in a nested embeddable", () => {
            expect(() => callResolveFieldToSql("addressAsEmbeddable.alternativeAddress.nonExistent", "Manufacturer")).toThrow(
                'Embedded field "nonExistent" not found in embeddable "alternativeAddress" of entity "Manufacturer"',
            );
        });
    });

    describe("relations combined with embeddables", () => {
        it("resolves a ManyToOne relation followed by an embeddable field", () => {
            expect(callResolveFieldToSql("product.manufacturer.addressAsEmbeddable.street", "ProductVariant")).toBe(
                '(SELECT (SELECT "Manufacturer"."address_as_embeddable_street" FROM "Manufacturer" WHERE "Manufacturer"."id" = "Product"."manufacturer_id") FROM "Product" WHERE "Product"."id" = "ProductVariant"."product_id")',
            );
        });

        it("resolves a ManyToOne relation followed by a nested embeddable field", () => {
            expect(callResolveFieldToSql("product.manufacturer.addressAsEmbeddable.alternativeAddress.zip", "ProductVariant")).toBe(
                '(SELECT (SELECT "Manufacturer"."address_as_embeddable_alternative_address_zip" FROM "Manufacturer" WHERE "Manufacturer"."id" = "Product"."manufacturer_id") FROM "Product" WHERE "Product"."id" = "ProductVariant"."product_id")',
            );
        });
    });

    describe("unsupported relation kinds", () => {
        it("throws for OneToMany relations", () => {
            expect(() => callResolveFieldToSql("tags.name", "ProductVariant")).toThrow(
                'Only ManyToOne, OneToOne relations and embeddables are supported for EntityInfo. "tags" is "1:m"',
            );
        });
    });

    describe("missing target metadata", () => {
        it("throws when a relation has no target metadata", () => {
            const meta = {
                className: "Broken",
                tableName: "Broken",
                primaryKeys: ["id"],
                props: [{ name: "ref", kind: "m:1", fieldNames: ["ref_id"], joinColumns: ["ref_id"], targetMeta: undefined }],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
            expect(() => resolveFieldToSql("ref.name", meta, "Broken")).toThrow('Relation "ref" has no target metadata');
        });
    });
});
