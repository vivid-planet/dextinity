// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { iconCategories } from "../../../docs/theme/__stories__/iconCategories";
import { defaultIconNames, deprecatedIconAliases } from "../iconRegistry";

const iconNames = Object.keys(defaultIconNames);
const iconsCss = readFileSync(new URL("../../../../icons.css", import.meta.url), "utf-8");
// A colored icon may switch to its flat form in high contrast, which sets a second variable for its name outside the icon set's `:root`
const iconSetCss = /^@layer dextinity \{\s*:root \{([^}]*)\}/.exec(iconsCss)?.[1];
if (iconSetCss === undefined) {
    throw new Error("icons.css must start with the icon set's `:root` block");
}
const variableNames = [...iconSetCss.matchAll(/--dextinity-(?:colored-)?icon-([a-z0-9-]+):/g)].map(([, name]) => name);
const svgFiles = readdirSync(new URL("../../../../svg/", import.meta.url)).filter((file) => file.endsWith(".svg"));

describe("default icon set", () => {
    it("has a variable for every icon name, with the SVG file of that name", () => {
        const namesWithoutVariable = iconNames.filter((name) => !iconsCss.includes(`icon-${name}: url("./svg/${name}.svg#icon");`));

        expect(namesWithoutVariable).toEqual([]);
    });

    it("has an SVG file for every icon name", () => {
        const namesWithoutFile = iconNames.filter((name) => !svgFiles.includes(`${name}.svg`));

        expect(namesWithoutFile).toEqual([]);
    });

    it("has an icon name for every variable", () => {
        const variablesWithoutName = variableNames.filter((name) => !iconNames.includes(name));

        expect(variablesWithoutName).toEqual([]);
    });

    it("has an icon name for every SVG file", () => {
        const filesWithoutName = svgFiles.filter((file) => !iconNames.includes(file.replace(".svg", "")));

        expect(filesWithoutName).toEqual([]);
    });

    it("has only one variable per icon name", () => {
        const namesWithSeveralVariables = variableNames.filter((name, index) => variableNames.indexOf(name) !== index);

        expect(namesWithSeveralVariables).toEqual([]);
    });

    it("has no deprecated alias that is also an icon name", () => {
        const aliasesThatAreIconNames = Object.keys(deprecatedIconAliases).filter((alias) => iconNames.includes(alias));

        expect(aliasesThatAreIconNames).toEqual([]);
    });

    it("lists every icon name in exactly one category", () => {
        const categorizedNames = iconCategories.flatMap(({ iconNames }) => iconNames);

        expect([...categorizedNames].sort()).toEqual([...iconNames].sort());
    });
});
