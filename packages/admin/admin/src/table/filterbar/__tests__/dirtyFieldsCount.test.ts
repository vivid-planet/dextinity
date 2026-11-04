import { describe, expect, it } from "vitest";

import { dirtyFieldsCount } from "../dirtyFieldsCount";

describe("dirtyFieldsCount", () => {
    it("should return 0 for empty values", () => {
        expect(dirtyFieldsCount({}, [])).toBe(0);
    });

    it("should count a single registered field with a truthy value", () => {
        expect(dirtyFieldsCount({ status: "active" }, ["status"])).toBe(1);
    });

    it("should not count an unregistered field", () => {
        expect(dirtyFieldsCount({ status: "active" }, [])).toBe(0);
    });

    it("should not count a registered field with a falsy value", () => {
        expect(dirtyFieldsCount({ status: null }, ["status"])).toBe(0);
        expect(dirtyFieldsCount({ status: 0 }, ["status"])).toBe(0);
        expect(dirtyFieldsCount({ status: "" }, ["status"])).toBe(0);
    });

    it("should count a registered array field by its length", () => {
        expect(dirtyFieldsCount({ tags: ["a", "b", "c"] }, ["tags"])).toBe(3);
    });

    it("should return 0 for an empty registered array field", () => {
        expect(dirtyFieldsCount({ tags: [] }, ["tags"])).toBe(0);
    });

    it("should count a registered range value (min/max object) as 1", () => {
        expect(dirtyFieldsCount({ price: { min: 10, max: 100 } }, ["price"])).toBe(1);
    });

    it("should not count an unregistered range value", () => {
        expect(dirtyFieldsCount({ price: { min: 10, max: 100 } }, [])).toBe(0);
    });

    it("should recurse into nested objects using dotted field paths", () => {
        const values = { address: { city: "Berlin", zip: "12345" } };
        expect(dirtyFieldsCount(values, ["address.city", "address.zip"])).toBe(2);
    });

    it("should count only registered sub-fields in nested objects", () => {
        const values = { address: { city: "Berlin", zip: "12345", country: "DE" } };
        expect(dirtyFieldsCount(values, ["address.city"])).toBe(1);
    });

    it("should sum counts across multiple top-level fields", () => {
        const values = { name: "Alice", role: "admin", tags: ["x", "y"] };
        expect(dirtyFieldsCount(values, ["name", "role", "tags"])).toBe(4);
    });

    it("should ignore fields present in values but absent from registeredFields", () => {
        const values = { visible: "yes", hidden: "no" };
        expect(dirtyFieldsCount(values, ["visible"])).toBe(1);
    });
});
