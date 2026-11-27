import { describe, expect, it } from "vitest";

import { findComponentChain, getComponentNames, getComponentStoryIds, getLevelAfterMove } from "../componentStories";

const stories = [
    { id: "topbar--with-scope", title: "Shell/Top bar & scope/TopBar", name: "With Scope" },
    { id: "topbar--default", title: "Shell/Top bar & scope/TopBar", name: "Default" },
    { id: "avatar--sizes", title: "Building blocks/Status, tags & badges/Avatar", name: "Sizes" },
    { id: "avatar--colors", title: "Building blocks/Status, tags & badges/Avatar", name: "Colors" },
    { id: "toolbar--vertical", title: "Building blocks/Buttons/Toolbar", name: "Vertical" },
    { id: "patterns-toolbar--default", title: "Patterns/Toolbar", name: "Default" },
    { id: "icon-button--default", title: "Building blocks/Buttons/IconButton", name: "Default" },
    { id: "toolbar-button--default", title: "Building blocks/Buttons/ToolbarButton", name: "Default" },
    { id: "filter-bar--default", title: "Building blocks/Data/FilterBar", name: "Default" },
    { id: "input--default", title: "Building blocks/Inputs/Input", name: "Default" },
];

describe("getComponentStoryIds", () => {
    it("prefers a component's Default story, falls back to its first one, and skips pattern pages of the same name", () => {
        expect(getComponentStoryIds(stories)).toEqual(
            new Map([
                ["TopBar", "topbar--default"],
                ["Avatar", "avatar--sizes"],
                ["Toolbar", "toolbar--vertical"],
                ["IconButton", "icon-button--default"],
                ["ToolbarButton", "toolbar-button--default"],
                ["FilterBar", "filter-bar--default"],
                ["Input", "input--default"],
            ]),
        );
    });
});

describe("getComponentNames", () => {
    it("reads the components from their root classes, outermost first, ignoring slot classes, the theme, and icons", () => {
        const element = document.createElement("div");
        element.className = "dextinityTopBar__search other dextinityTheme dextinityIcon";
        expect(getComponentNames(element)).toEqual([]);

        element.className = "dextinityIconButton dextinityToolbarButton";
        expect(getComponentNames(element)).toEqual(["ToolbarButton", "IconButton"]);
    });
});

describe("findComponentChain", () => {
    it("lists the components with a story around the element, outermost first, skipping components without one", () => {
        document.body.innerHTML = `
            <div class="dextinityFilterBar">
                <div class="dextinityUnknownPart"><div class="dextinityInput"><input id="target" /></div></div>
            </div>`;
        const chain = findComponentChain(document.getElementById("target"), getComponentStoryIds(stories));
        expect(chain.map(({ componentName, storyId }) => ({ componentName, storyId }))).toEqual([
            { componentName: "FilterBar", storyId: "filter-bar--default" },
            { componentName: "Input", storyId: "input--default" },
        ]);
        expect(chain.map(({ element }) => element)).toEqual([
            document.querySelector(".dextinityFilterBar"),
            document.querySelector(".dextinityInput"),
        ]);
    });

    it("gives each component with a story of an element its own level, the outer one first", () => {
        document.body.innerHTML = `
            <div class="dextinityToolbar">
                <button id="target" class="dextinityIconButton dextinityToolbarButton">B</button>
            </div>`;
        const chain = findComponentChain(document.getElementById("target"), getComponentStoryIds(stories));
        expect(chain.map(({ componentName }) => componentName)).toEqual(["Toolbar", "ToolbarButton", "IconButton"]);
    });

    it("is empty outside of components with a story", () => {
        document.body.innerHTML = `<div class="dextinityUnknownPart"><span id="target">Text</span></div>`;
        expect(findComponentChain(document.getElementById("target"), getComponentStoryIds(stories))).toEqual([]);
        expect(findComponentChain(null, getComponentStoryIds(stories))).toEqual([]);
    });
});

describe("getLevelAfterMove", () => {
    function renderFilterBar() {
        document.body.innerHTML = `
            <div class="dextinityFilterBar">
                <div class="dextinityInput"><input id="input" /></div>
                <button id="button" class="dextinityIconButton">B</button>
            </div>`;
        const componentStoryIds = getComponentStoryIds(stories);
        return (id: string) => findComponentChain(document.getElementById(id), componentStoryIds);
    }

    it("keeps the chosen level while the pointer stays on the same innermost component", () => {
        const findChain = renderFilterBar();
        expect(getLevelAfterMove(findChain("input"), 0, findChain("input"))).toBe(0);
    });

    it("starts at the innermost level on another component", () => {
        const findChain = renderFilterBar();
        expect(getLevelAfterMove(findChain("input"), 0, findChain("button"))).toBe(1);
        expect(getLevelAfterMove([], -1, findChain("input"))).toBe(1);
    });
});
