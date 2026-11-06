import { describe, expect, it } from "vitest";

import type { CheckboxGroupOption } from "../CheckboxGroup";
import { optionCheckState, optionValues, toggleOption } from "../checkboxGroupSelection";

const english: CheckboxGroupOption = { value: "main-en", label: "English" };

const options: CheckboxGroupOption[] = [
    {
        value: "main",
        label: "Main",
        children: [{ value: "main-de", label: "German" }, english, { value: "main-fr", label: "French", disabled: true }],
    },
    { value: "secondary", label: "Secondary", children: [{ value: "secondary-en", label: "English" }] },
    { value: "archive", label: "Archive" },
];

describe("optionValues", () => {
    it("stands for the options inside a group, not the group itself", () => {
        expect(optionValues(options[0])).toEqual(["main-de", "main-en", "main-fr"]);
        expect(optionValues(options[0], true)).toEqual(["main-de", "main-en"]);
        expect(optionValues(options[2])).toEqual(["archive"]);
    });
});

describe("optionCheckState", () => {
    it("checks a group when all its options are, and marks it indeterminate when some are", () => {
        expect(optionCheckState(options[0], new Set(["main-de"]))).toEqual({ checked: false, indeterminate: true });
        expect(optionCheckState(options[0], new Set(["main-de", "main-en", "main-fr"]))).toEqual({ checked: true, indeterminate: false });
        expect(optionCheckState(options[1], new Set())).toEqual({ checked: false, indeterminate: false });
    });
});

describe("toggleOption", () => {
    it("toggles a single option, keeping the options' order", () => {
        expect(toggleOption(options, ["archive"], english)).toEqual(["main-en", "archive"]);
        expect(toggleOption(options, ["main-en", "archive"], options[2])).toEqual(["main-en"]);
    });

    it("selects all enabled options of a group, then clears them, leaving disabled ones as they are", () => {
        const selected = toggleOption(options, ["main-de"], options[0]);
        expect(selected).toEqual(["main-de", "main-en"]);
        expect(toggleOption(options, selected, options[0])).toEqual([]);
        expect(toggleOption(options, ["main-de", "main-en", "main-fr"], options[0])).toEqual(["main-fr"]);
    });

    it("keeps values that match no option", () => {
        expect(toggleOption(options, ["legacy"], options[2])).toEqual(["archive", "legacy"]);
    });
});
