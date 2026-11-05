// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { defaultIconNames } from "./iconRegistry";

const iconNames = Object.keys(defaultIconNames);
const iconsCss = readFileSync(new URL("../../../icons.css", import.meta.url), "utf-8");
const variableNames = [...iconsCss.matchAll(/--dextinity-icon-([a-z0-9-]+):/g)].map(([, name]) => name);
const svgFiles = readdirSync(new URL("../../../svg/", import.meta.url)).filter((file) => file.endsWith(".svg"));

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
});
