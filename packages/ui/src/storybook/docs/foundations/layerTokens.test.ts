import { describe, expect, it } from "vitest";

import { layerTokens } from "./layerTokens";

describe("layerTokens", () => {
    it("keeps the first definition of a token declared per color scheme", () => {
        const source = [
            ":root {",
            "    --dextinity-color-text: oklch(0.19 0.015 #{$neutral-hue});",
            "}",
            "[data-dextinity-color-scheme='dark'] {",
            "    --dextinity-color-text: oklch(0.965 0.004 #{$neutral-hue});",
            "}",
        ].join("\n");

        expect(layerTokens(source)).toEqual([{ name: "--dextinity-color-text", definition: "oklch(0.19 0.015 $neutral-hue)" }]);
    });
});
