import ts from "typescript";
import { describe, expect, it } from "vitest";

import { collectImports, transformConfigFile } from "../transformConfig";

describe("transformConfig", () => {
    function parseString(sourceFileText: string) {
        return transformConfigFile("test.tsx", sourceFileText);
    }
    it("parses a simple config using defineConfig", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
            });
        `);
        expect(config).toContain("export default defineConfig<GQLProduct>({");
        expect(config).toContain('type: "grid"');
    });

    it("parses a simple static json", () => {
        const config = parseString(`
            export default {
                type: "grid",
                gqlType: "Product",
            };
        `);
        expect(config).toContain('type: "grid"');
    });

    it("parses a simple static json that uses satisfies", () => {
        const config = parseString(`
            import { GQLProduct } from "@src/graphql.generated";
            import { GeneratorConfig } from "@dextinity/admin-generator";

            export default {
                type: "grid",
                gqlType: "Product",
            } satisfies GeneratorConfig<GQLProduct>;
        `);
        expect(config).toContain('type: "grid"');
    });

    it("parses an arrow function", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            export default defineConfig<GQLProduct>({
                type: "form",
                fields: [{
                    name: "foo",
                    validate: () => true
                }]
            });
        `);
        expect(config).toContain('type: "form"');
        expect(config).toMatch(/validate:\s*{\s*code: "\(\) => true",\s*imports: \[\]/);
    });

    it("parses an arrow function referencing an imported component", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            import { ProductTitle } from "./ProductTitle";

            export default defineConfig<GQLProduct>({
                type: "grid",
                columns: [
                    {
                        name: "title",
                        renderCell: () => <ProductTitle />,
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toMatch(
            /renderCell:\s*{\s*code: "\(\) => <ProductTitle \/>",\s*imports: \[\{ name: "ProductTitle", import: ".\/ProductTitle" \}\]/,
        );
    });

    it("parses an arrow function referencing an imported component using an function body", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            import { ProductTitle } from "./ProductTitle";

            export default defineConfig<GQLProduct>({
                type: "grid",
                columns: [
                    {
                        name: "title",
                        renderCell: () => { return <ProductTitle /> },
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toMatch(
            /renderCell:\s*{\s*code: "\(\) => \{ return <ProductTitle \/> \}",\s*imports: \[\{ name: "ProductTitle", import: ".\/ProductTitle" \}\]/,
        );
    });

    it("parses a reference to a locally defined variable", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            const abc = 123;

            export default defineConfig<GQLProduct>({
                foo: abc
            });
        `);
        expect(config).toContain("foo: abc"); //unchanged
    });

    it("parser throws error for function at unsupported location", () => {
        expect(() => {
            parseString(`
                import { defineConfig } from "@dextinity/admin-generator";
                import { GQLProduct } from "@src/graphql.generated";
        
                export default defineConfig<GQLProduct>({
                    foo: () => true
                });
            `);
        }).toThrow();
    });

    it("doesn't transform a function call", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            import { foo } from "./foo";

            export default defineConfig<GQLProduct>({
                type: "grid",
                columns: [
                    {
                        name: foo(),
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toContain("name: foo()");
    });

    it("doesn't transform a imported function call with an arrow function", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            import { foo } from "./foo";

            export default defineConfig<GQLProduct>({
                type: "grid",
                columns: [
                    {
                        name: foo(() => true),
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toContain("name: foo(() => true)");
    });

    it("doesn't transform a function call with an arrow function", () => {
        const config = parseString(`
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            function foo() {}

            export default defineConfig<GQLProduct>({
                type: "grid",
                columns: [
                    {
                        name: foo(() => true),
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toContain("name: foo(() => true)");
    });

    it("parses injectFormVariables", () => {
        const config = parseString(`
            import { defineConfig, injectFormVariables } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            export default defineConfig<GQLProduct>({
                type: "form",
                fields: [
                    {
                        name: "title",
                        validate: injectFormVariables(({ id }) => (value: string) => { return value != id; }),
                    }
                ]
            });
        `);
        expect(config).toContain('type: "form"');
        expect(config.replace(/\s+/g, " ")).toContain(`validate: { code: "(value: string) => { return value != id; }", imports: [] }`);
    });

    describe("collectImports", () => {
        function parseString(code: string) {
            return ts.createSourceFile(
                "test.tsx",
                code,
                ts.ScriptTarget.ES2024, // language version
                true, // setParentNodes (useful for some traversals)
            );
        }
        it("collects named relative imports", () => {
            const sourceFile = parseString(`import { productTypeValues } from "./productTypeValues";`);
            const importedIdentifiers = collectImports(sourceFile);
            expect(importedIdentifiers).toEqual(new Map([["productTypeValues", { name: "productTypeValues", import: "./productTypeValues" }]]));
        });
        it("collects named package imports", () => {
            const sourceFile = parseString(`import { DamImageBlock } from "@dextinity/cms-admin";`);
            const importedIdentifiers = collectImports(sourceFile);
            expect(importedIdentifiers).toEqual(new Map([["DamImageBlock", { name: "DamImageBlock", import: "@dextinity/cms-admin" }]]));
        });
        it("collects default imports", () => {
            const sourceFile = parseString(`import debounce from "p-debounce";`);
            const importedIdentifiers = collectImports(sourceFile);
            expect(importedIdentifiers).toEqual(new Map([["debounce", { defaultImport: true, name: "debounce", import: "p-debounce" }]]));
        });
    });

    it("parses FormattedMessage", () => {
        const config = parseString(`
            import { FormattedMessage } from "react-intl";
            import { defineConfig } from "@dextinity/admin-generator";
            import { GQLProduct } from "@src/graphql.generated";

            export default defineConfig<GQLProduct>({
                type: "grid",
                newEntryText: <FormattedMessage id="product.newEntryText" defaultMessage="Create new product" />,
                columns: [
                    {
                        name: "foo",
                    }
                ]
            });
        `);
        expect(config).toContain('type: "grid"');
        expect(config).toContain('newEntryText: <FormattedMessage id="product.newEntryText" defaultMessage="Create new product"/>');
    });
});
