import { expect, it } from "vitest";

import { parseTokens } from "./parseTokens";

it("reads declarations with the comment directly above as description", () => {
    const source = `@include scope.component-tokens {
    // Height of the field
    --dextinity-input-height: var(--dextinity-density-field-height);

    --dextinity-input-radius: calc(10px * var(--dextinity-brand-radius-factor));
}`;

    expect(parseTokens(source)).toEqual([
        { name: "--dextinity-input-height", definition: "var(--dextinity-density-field-height)", description: "Height of the field" },
        { name: "--dextinity-input-radius", definition: "calc(10px * var(--dextinity-brand-radius-factor))", description: undefined },
    ]);
});
