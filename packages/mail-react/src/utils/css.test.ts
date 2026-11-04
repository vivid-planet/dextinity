import { describe, expect, it } from "vitest";

import { css } from "./css.js";

describe("css tagged-template helper", () => {
    it("returns static template text exactly", () => {
        const result = css`
            color: red;
            font-size: 16px;
        `;

        expect(result).toBe(`
            color: red;
            font-size: 16px;
        `);
    });

    it("resolves interpolated values correctly", () => {
        const color = "blue";
        const size = 14;

        const result = css`
            color: ${color};
            font-size: ${size}px;
        `;

        expect(result).toBe(`
            color: blue;
            font-size: 14px;
        `);
    });
});
