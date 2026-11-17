import type { EntityMetadata } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { Searchable } from "../decorators/searchable.decorator.js";
import { getSearchFieldsFromMetadata } from "./search-fields.helper.js";

class Manufacturer {
    name: string;

    @Searchable(false)
    internalNote: string;
}

class Product {
    title: string;

    @Searchable(false)
    slug: string;

    manufacturer: Manufacturer;
}

function createMetadata(entityClass: object, props: Array<Record<string, unknown>>) {
    return { class: entityClass, props } as unknown as EntityMetadata;
}

describe("getSearchFieldsFromMetadata", () => {
    const manufacturerMetadata = createMetadata(Manufacturer, [
        { name: "name", type: "string", kind: "scalar", columnTypes: ["text"] },
        { name: "internalNote", type: "string", kind: "scalar", columnTypes: ["text"] },
    ]);

    it("should search string fields unless they are excluded from search", () => {
        const metadata = createMetadata(Product, [
            { name: "title", type: "string", kind: "scalar", columnTypes: ["text"] },
            { name: "slug", type: "string", kind: "scalar", columnTypes: ["text"] },
        ]);

        expect(getSearchFieldsFromMetadata(metadata)).toEqual([{ name: "title", needsCastToText: false }]);
    });

    it("should skip fields of a relation that are excluded from search", () => {
        const metadata = createMetadata(Product, [
            { name: "manufacturer", type: "Manufacturer", kind: "m:1", columnTypes: ["uuid"], targetMeta: manufacturerMetadata },
        ]);

        expect(getSearchFieldsFromMetadata(metadata)).toEqual([{ name: "manufacturer.name", needsCastToText: false }]);
    });

    it("should search a field again that a subclass makes searchable", () => {
        class ProductWithSearchableSlug extends Product {
            @Searchable()
            declare slug: string;
        }
        const metadata = createMetadata(ProductWithSearchableSlug, [
            { name: "title", type: "string", kind: "scalar", columnTypes: ["text"] },
            { name: "slug", type: "string", kind: "scalar", columnTypes: ["text"] },
        ]);

        expect(getSearchFieldsFromMetadata(metadata)).toEqual([
            { name: "title", needsCastToText: false },
            { name: "slug", needsCastToText: false },
        ]);
    });

    it("should skip a relation that is excluded from search", () => {
        class ProductWithExcludedManufacturer {
            @Searchable(false)
            manufacturer: Manufacturer;
        }
        const metadata = createMetadata(ProductWithExcludedManufacturer, [
            { name: "manufacturer", type: "Manufacturer", kind: "m:1", columnTypes: ["uuid"], targetMeta: manufacturerMetadata },
        ]);

        expect(getSearchFieldsFromMetadata(metadata)).toEqual([]);
    });
});
