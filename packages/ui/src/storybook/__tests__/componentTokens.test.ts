import { join } from "node:path";

import { expect, it } from "vitest";

import { componentTokensOf } from "../../../.storybook/componentTokens";

const componentsDirectory = join(import.meta.dirname, "../../components");

function tokenNamesOf(storyFile: string) {
    return componentTokensOf(join(componentsDirectory, storyFile))?.tokens.map((token) => token.name);
}

it("lists only the tokens the component reads from a tokens file that holds the tokens of several components", () => {
    expect(tokenNamesOf("toolbar/__stories__/ToolbarSeparator.stories.tsx")).toEqual([
        "--dextinity-toolbar-separator-color",
        "--dextinity-toolbar-separator-space",
        "--dextinity-toolbar-separator-inset",
    ]);
});

it("lists the tokens of internal parts and of token values, but not those of exported components it renders", () => {
    const tokenNames = tokenNamesOf("datePicker/__stories__/DateTimePicker.stories.tsx");

    expect(tokenNames).toContain("--dextinity-date-picker-day-size");
    expect(tokenNames).toContain("--dextinity-date-picker-time-list-max-height");
    expect(tokenNames).toContain("--dextinity-select-item-height");
    expect(tokenNames).toContain("--dextinity-field-placeholder");
    expect(tokenNames).not.toContain("--dextinity-field-height");
});

it("lists the tokens a story file names in parameters.tokens instead of those the component reads", () => {
    expect(tokenNamesOf("typography/__stories__/Typography.stories.tsx")).toEqual([
        "--dextinity-font-family-text",
        "--dextinity-font-family-display",
        "--dextinity-font-family-mono",
        "--dextinity-typography-display-font-weight",
        "--dextinity-typography-display-letter-spacing",
    ]);
});

it("lists no tokens for a story file without meta.component", () => {
    expect(tokenNamesOf("undoToast/__stories__/useUndoToast.stories.tsx")).toBeUndefined();
});
