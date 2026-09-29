import { describe, expect, it } from "vitest";

import { IsSlugConstraint } from "./is-slug";

describe("IsSlug", () => {
    describe("findAll", () => {
        it("should accept a valid slug", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("dextinity")).toBe(true);
        });
        it("should accept a valid slug with numbers", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("dextinity--2")).toBe(true);
        });
        it("should accept a valid slug with special char at the end", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("abc-")).toBe(true);
        });
        it("should accept a valid slug with uppercase characters", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("Dextinity")).toBe(true);
        });
        it("should not accept space", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("com et")).toBe(false);
        });
        it("should not accept umlaut", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("comät")).toBe(false);
        });
        it("should not allow url encoded characters", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("slug%2F2")).toBeFalsy();
        });
        it("should not allow percent encoded special characters ../", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("%2E%2E%2Ftest")).toBeFalsy();
        });
        it("should not allow special characters ../", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("../test")).toBeFalsy();
        });
        it("should not allow special character / ", async () => {
            const validator = new IsSlugConstraint();
            expect(await validator.validate("slug/")).toBeFalsy();
        });
    });
});
