import { describe, expect, it } from "vitest";

import { generateEnumFilterDto } from "../generate-enum-filter-dto";

describe("generateEnumFilterDto", () => {
    describe("path", () => {
        it("should generate filter at same path where enum is located", () => {
            const result = generateEnumFilterDto("enum", "Status", "src/products/product");

            expect(result.name).toBe("dto/status.enum-filter.ts");
            expect(result.type).toBe("enum-filter");
            expect(result.targetDirectory).toBe("src/products/generated");
        });

        it("should exclude entities in path", () => {
            const result = generateEnumFilterDto("enum", "Status", "src/products/entities/product");

            expect(result.name).toBe("dto/status.enum-filter.ts");
            expect(result.type).toBe("enum-filter");
            expect(result.targetDirectory).toBe("src/products/generated");
        });

        it("should use enum name not file name", () => {
            const result = generateEnumFilterDto("enum", "Foo", "src/products/entities/status.enum");

            expect(result.name).toBe("dto/foo.enum-filter.ts");
            expect(result.type).toBe("enum-filter");
            expect(result.targetDirectory).toBe("src/products/generated");
        });

        it("use kebab-case", () => {
            const result = generateEnumFilterDto("enum", "FooBar", "src/products/entities/status.enum");

            expect(result.name).toBe("dto/foo-bar.enum-filter.ts");
            expect(result.type).toBe("enum-filter");
            expect(result.targetDirectory).toBe("src/products/generated");
        });
    });
});
