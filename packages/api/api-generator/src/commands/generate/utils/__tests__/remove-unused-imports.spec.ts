import ts from "typescript";
import { describe, expect, it } from "vitest";

import { removeUnusedImports } from "../write-generated-file";

function runTransform(input: string): string {
    input = input.trim().replace(/^\s+/gm, "");
    const sourceFile = ts.createSourceFile("file.ts", input, ts.ScriptTarget.ES2024, true, ts.ScriptKind.TS);

    const result = ts.transform(sourceFile, [removeUnusedImports()]);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    const transformedSourceFile = result.transformed[0];
    const output = printer.printFile(transformedSourceFile).trim();

    result.dispose();
    return output;
}

describe("removeUnusedImports", () => {
    it("removes completely unused imports", () => {
        const input = `
      import fs from 'fs';
      import { readFile, writeFile } from 'fs';
      const data = readFile('data.txt');
    `;

        const expected = `
      import { readFile } from 'fs';
      const data = readFile('data.txt');
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });

    it("removes default import if unused", () => {
        const input = `
      import defaultThing from 'mod';
      console.log('hello');
    `;

        const expected = `
      console.log('hello');
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });

    it("removes entire import if nothing is used", () => {
        const input = `
      import { a, b, c } from 'stuff';
      const x = 5;
    `;

        const expected = `
      const x = 5;
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });

    it("keeps side-effect imports", () => {
        const input = `
      import 'some-polyfill';
      const x = 1;
    `;

        const expected = `
      import 'some-polyfill';
      const x = 1;
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });

    it("removes unused named specifiers but keeps used ones", () => {
        const input = `
      import { a, b, c } from 'lib';
      console.log(a);
    `;

        const expected = `
      import { a } from 'lib';
      console.log(a);
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });

    it("keeps namespace import if used", () => {
        const input = `
      import * as fs from 'fs';
      fs.readFile('test.txt');
    `;

        const expected = `
      import * as fs from 'fs';
      fs.readFile('test.txt');
    `;

        expect(runTransform(input)).toBe(expected.trim().replace(/^\s+/gm, ""));
    });
});
