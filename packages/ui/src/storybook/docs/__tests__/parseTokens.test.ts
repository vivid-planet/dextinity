import { expect, it } from "vitest";

import { parseTokens } from "../parseTokens";

it("reads declarations with the comment directly above as description", () => {
    const source = `@mixin tokens {
    // Height of the field
    --dextinity-input-height: var(--dextinity-density-field-height);

    --dextinity-input-radius: calc(10px * var(--dextinity-brand-radius-factor));
}`;

    expect(parseTokens(source)).toEqual([
        { name: "--dextinity-input-height", definition: "var(--dextinity-density-field-height)", description: "Height of the field" },
        { name: "--dextinity-input-radius", definition: "calc(10px * var(--dextinity-brand-radius-factor))", description: undefined },
    ]);
});

it("reads the dark-tokens and high-contrast-tokens mixins as the color schemes' definitions of the same token", () => {
    const source = `@mixin tokens {
    --dextinity-tabs-count-line: var(--dextinity-color-line);
}

@mixin dark-tokens {
    --dextinity-tabs-count-line: var(--dextinity-color-line-strong);
}

@mixin high-contrast-tokens {
    // Ignored: the description is the one of the token itself
    --dextinity-tabs-count-line: var(--dextinity-color-warning);
}`;

    expect(parseTokens(source)).toEqual([
        {
            name: "--dextinity-tabs-count-line",
            definition: "var(--dextinity-color-line)",
            description: undefined,
            darkDefinition: "var(--dextinity-color-line-strong)",
            highContrastDefinition: "var(--dextinity-color-warning)",
        },
    ]);
});
