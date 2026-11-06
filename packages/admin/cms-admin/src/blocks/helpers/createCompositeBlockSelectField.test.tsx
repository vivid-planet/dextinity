import { FormattedMessage } from "react-intl";
import { cleanup, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCompositeBlockSelectField } from "./createCompositeBlockSelectField";

const optionsString = [
    { label: "A", value: "a" },
    { label: "B", value: "b" },
];
const optionsNumber = [
    { label: "One", value: 1 },
    { label: "Two", value: 2 },
];

afterEach(cleanup);

describe("createCompositeBlockSelectField", () => {
    it("supports string", () => {
        const [block] = createCompositeBlockSelectField<string>({
            defaultValue: "a",
            label: "Letter",
            options: optionsString,
        });
        expect(block.defaultValues()).toBe("a");
    });

    it("supports number", () => {
        const [block] = createCompositeBlockSelectField<number>({
            defaultValue: 1,
            label: "Number",
            options: optionsNumber,
        });
        expect(block.defaultValues()).toBe(1);
    });

    it("supports string[]", () => {
        const [block] = createCompositeBlockSelectField<string[]>({
            defaultValue: ["a"],
            label: "Letter",
            options: optionsString,
        });
        expect(block.defaultValues()).toEqual(["a"]);
    });

    it("supports number[]", () => {
        const [block] = createCompositeBlockSelectField<number[]>({
            defaultValue: [1],
            label: "Number",
            options: optionsNumber,
        });
        expect(block.defaultValues()).toEqual([1]);
    });

    it("shows the chosen option of a number field", () => {
        const [block] = createCompositeBlockSelectField<number>({ defaultValue: 1, label: "Number", options: optionsNumber });
        render(<block.AdminComponent state={2} updateState={vi.fn()} />);

        expect(screen.getByRole("combobox", { name: /Number/ }).textContent).toContain("Two");
    });

    it("shows a FormattedMessage label of the chosen option", () => {
        const [block] = createCompositeBlockSelectField<string>({
            defaultValue: "a",
            label: "Letter",
            options: [{ value: "a", label: <FormattedMessage id="test.letterA" defaultMessage="Letter A" /> }],
        });
        render(<block.AdminComponent state="a" updateState={vi.fn()} />);

        expect(screen.getByRole("combobox", { name: /Letter/ }).textContent).toContain("Letter A");
    });
});
