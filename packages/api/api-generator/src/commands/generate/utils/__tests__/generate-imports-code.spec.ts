import { describe, expect, it } from "vitest";

import { generateImportsCode } from "../generate-imports-code";

describe("generateImportsCode", () => {
    it("groups imports by path and sorts them by name", () => {
        expect(
            generateImportsCode([
                { name: "b", importPath: "lib" },
                { name: "a", importPath: "lib" },
                { name: "c", importPath: "other" },
            ]),
        ).toBe(`import { a, b } from "lib";\nimport { c } from "other";\n`);
    });

    it("marks type-only imports inline", () => {
        expect(
            generateImportsCode([
                { name: "a", importPath: "lib" },
                { name: "B", importPath: "lib", isTypeOnly: true },
            ]),
        ).toBe(`import { type B, a } from "lib";\n`);
    });

    it("uses a type-only import declaration if all imports of a path are type-only", () => {
        expect(
            generateImportsCode([
                { name: "A", importPath: "lib", isTypeOnly: true },
                { name: "B", importPath: "lib", isTypeOnly: true },
            ]),
        ).toBe(`import type { A, B } from "lib";\n`);
    });

    it("prefers a value import if the same name is imported as type and value", () => {
        expect(
            generateImportsCode([
                { name: "A", importPath: "lib", isTypeOnly: true },
                { name: "A", importPath: "lib" },
            ]),
        ).toBe(`import { A } from "lib";\n`);
    });
});
