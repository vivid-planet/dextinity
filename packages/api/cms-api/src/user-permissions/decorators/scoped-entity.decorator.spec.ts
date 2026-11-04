import { Injectable } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { type EntityScopeServiceInterface, isEntityScopeMapping } from "./scoped-entity.decorator";

@Injectable()
class SomeScopeService implements EntityScopeServiceInterface {
    async getEntityScope() {
        return {};
    }
}

describe("isEntityScopeMapping", () => {
    it("accepts a field-path string", () => {
        expect(isEntityScopeMapping("company.scope")).toBe(true);
    });

    it("accepts an object mapping scope keys to field paths", () => {
        expect(isEntityScopeMapping({ companyId: "company.id" })).toBe(true);
    });

    it("accepts an array of mappings", () => {
        expect(isEntityScopeMapping(["company.scope", { companyId: "company.id" }])).toBe(true);
    });

    it("rejects a callback function", () => {
        expect(isEntityScopeMapping(() => ({}))).toBe(false);
    });

    it("rejects an injectable service class", () => {
        expect(isEntityScopeMapping(SomeScopeService)).toBe(false);
    });

    it("rejects an object with non-string values", () => {
        expect(isEntityScopeMapping({ companyId: 123 } as unknown as Record<string, string>)).toBe(false);
    });

    it("rejects an array containing a non-mapping element", () => {
        expect(isEntityScopeMapping(["company.scope", (() => ({})) as unknown as string])).toBe(false);
    });
});
