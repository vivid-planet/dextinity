import { describe, expect, it } from "vitest";

import { createCompositeBlockSelectField } from "./createCompositeBlockSelectField";

const optionsString = [
    { label: "A", value: "a" },
    { label: "B", value: "b" },
];
const optionsNumber = [
    { label: "One", value: 1 },
    { label: "Two", value: 2 },
];

describe("createCompositeBlockSelectField", () => {
    it("supports string", () => {
        const [block] = createCompositeBlockSelectField<string>({
            defaultValue: "a",
            options: optionsString,
        });
        expect(block.defaultValues()).toBe("a");
    });

    it("supports number", () => {
        const [block] = createCompositeBlockSelectField<number>({
            defaultValue: 1,
            options: optionsNumber,
        });
        expect(block.defaultValues()).toBe(1);
    });

    it("supports string[]", () => {
        const [block] = createCompositeBlockSelectField<string[]>({
            defaultValue: ["a"],
            options: optionsString,
        });
        expect(block.defaultValues()).toEqual(["a"]);
    });

    it("supports number[]", () => {
        const [block] = createCompositeBlockSelectField<number[]>({
            defaultValue: [1],
            options: optionsNumber,
        });
        expect(block.defaultValues()).toEqual([1]);
    });

    it("supports undefined for an optional value", () => {
        const [block] = createCompositeBlockSelectField<"a" | "b" | undefined>({
            defaultValue: undefined,
            options: [
                { label: "A", value: "a" },
                { label: "B", value: "b" },
            ],
        });
        expect(block.defaultValues()).toBeUndefined();
    });
});
