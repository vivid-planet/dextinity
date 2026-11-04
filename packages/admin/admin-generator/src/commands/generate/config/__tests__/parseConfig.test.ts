import { promises as fs } from "fs";
import { afterAll, describe, expect, it } from "vitest";

import { parseConfig } from "../parseConfig";

describe("parseConfig", () => {
    it("parses a simple file", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
            }

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
                columns: [],
            });
        `;
        await fs.writeFile(`${__dirname}/.test1.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test1.dextinityGen.tsx`);
        expect(config.type).toEqual("grid");
    });

    it("executes strings", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
            }

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
                fragmentName: "Foo"+"Bar",
                columns: [],
            });
        `;
        await fs.writeFile(`${__dirname}/.test2.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test2.dextinityGen.tsx`);
        expect(config.fragmentName).toEqual("FooBar");
    });

    it("uses local variable in config", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
                type: string;
            }
            const typeValues = [{ value: "Cap", label: "Cap" }, "Shirt", "Tie"];

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
                columns: [
                    { type: "staticSelect", name: "type", values: typeValues },
                ]
            });
        `;
        await fs.writeFile(`${__dirname}/.test3.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test3.dextinityGen.tsx`);
        expect(config.columns[0]).toEqual({
            type: "staticSelect",
            name: "type",
            values: [{ value: "Cap", label: "Cap" }, "Shirt", "Tie"],
        });
    });

    it("executes code with local variable", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
                type: string;
            }
            const typeValues = ["Cap", "Shirt", "Tie"];

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
                columns: [
                    { type: "staticSelect", name: "type", values: typeValues.map((value) => ({ value, label: "Nice "+value })) },
                ]
            });
        `;
        await fs.writeFile(`${__dirname}/.test4.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test4.dextinityGen.tsx`);
        expect(config.columns[0]).toEqual({
            type: "staticSelect",
            name: "type",
            values: [
                { value: "Cap", label: "Nice Cap" },
                { value: "Shirt", label: "Nice Shirt" },
                { value: "Tie", label: "Nice Tie" },
            ],
        });
    });

    it("uses import without executing", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            import { validateName } from "xxx";

            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
                type: string;
            }

            export default defineConfig<GQLProduct>({
                type: "form",
                fields: [{
                    type: "text",
                    name: "name",
                    validate: validateName
                }]
            });
        `;
        await fs.writeFile(`${__dirname}/.test5.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test5.dextinityGen.tsx`);
        expect(config.fields[0]).toEqual({
            type: "text",
            name: "name",
            validate: { import: "xxx", name: "validateName" },
        });
    });

    it("uses an arrow function as code", async () => {
        const configString = `
            import { defineConfig } from "../../generate-command";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
            }

            export default defineConfig<GQLProduct>({
                type: "form",
                fields: [{
                    type: "text",
                    name: "name",
                    validate: () => true
                }]
            });
        `;
        await fs.writeFile(`${__dirname}/.test6.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test6.dextinityGen.tsx`);
        expect(config.fields[0].validate).toEqual({ code: "() => true", imports: [] });
    });

    it("executes import when import is not directly supported", async () => {
        const configImportString = `
            export const typeValues = ["Cap", "Shirt", "Tie"];
        `;
        await fs.writeFile(`${__dirname}/.test7-import.dextinityGen.tsx`, configImportString);
        const configString = `
            import { defineConfig } from "../../generate-command";
            import { typeValues } from "./.test7-import.dextinityGen";
            type GQLProduct = {
                __typename?: "Product";
                id: string;
                name: string;
                type: string;
            }

            export default defineConfig<GQLProduct>({
                type: "grid",
                gqlType: "Product",
                columns: [
                    { type: "staticSelect", name: "type", values: typeValues,
                ]
            });
        `;
        await fs.writeFile(`${__dirname}/.test7.dextinityGen.tsx`, configString);
        const config = await parseConfig(`${__dirname}/.test7.dextinityGen.tsx`);
        expect(config.columns[0]).toEqual({
            type: "staticSelect",
            name: "type",
            values: ["Cap", "Shirt", "Tie"],
        });
    });

    afterAll(async () => {
        for await (const file of fs.glob(`${__dirname}/.test*.dextinityGen.tsx`)) {
            await fs.rm(file);
        }
    });
});
