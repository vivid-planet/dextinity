import { describe, expect, it } from "vitest";

import { isEmptyValue, toErrorMessage, withRequiredRule } from "./useFieldAdapter";

describe("withRequiredRule", () => {
    it("keeps the rules of an optional field", () => {
        const rules = { maxLength: 10 };
        expect(withRequiredRule(rules, false, isEmptyValue)).toBe(rules);
    });

    it("validates required first and keeps a custom validation", () => {
        const validate = (value: unknown) => value !== "taken" || "Taken";
        const rules = withRequiredRule({ validate }, true, isEmptyValue);
        const validations = rules?.validate as Record<string, (value: unknown) => unknown>;

        expect(Object.keys(validations)).toEqual(["required", "validate"]);
        expect(validations.required("")).toBe(false);
        expect(validations.required("Benefits")).toBe(true);
        expect(validations.validate("taken")).toBe("Taken");
    });
});

describe("toErrorMessage", () => {
    it("shows the requiredMessage for a required error without a message", () => {
        expect(toErrorMessage({ type: "required", message: "" }, "Enter a title")).toBe("Enter a title");
    });

    it("prefers the error's own message", () => {
        expect(toErrorMessage({ type: "required", message: "Custom" }, "Enter a title")).toBe("Custom");
        expect(toErrorMessage({ type: "server", message: "Taken" }, "Enter a title")).toBe("Taken");
        expect(toErrorMessage(undefined, "Enter a title")).toBeUndefined();
    });
});
