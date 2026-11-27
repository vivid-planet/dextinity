import { describe, expect, it } from "vitest";

import { findComponentChain, getComponentNames, getComponentStoryIds, getLevelAfterMove, getLevelHint, getSlotLabel } from "../componentStories";

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
    { id: "side-nav--default", title: "Shell/Navigation/SideNav", name: "Default" },
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
                ["SideNav", "side-nav--default"],
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

describe("findComponentChain with slots", () => {
    function findChain(id: string) {
        return findComponentChain(document.getElementById(id), getComponentStoryIds(stories)).map(
            ({ element, componentName, slotName, storyId }) => ({
                id: element.id || element.className,
                componentName,
                slotName,
                storyId,
            }),
        );
    }

    it("adds the innermost slot under the pointer as the last level, with the story of the component it is part of", () => {
        document.body.innerHTML = `
            <div class="dextinityFilterBar">
                <label id="search" class="dextinityFilterBar__search"><span id="icon"></span><input id="input" class="dextinityFilterBar__input" /></label>
            </div>`;
        expect(findChain("input")).toEqual([
            { id: "dextinityFilterBar", componentName: "FilterBar", slotName: undefined, storyId: "filter-bar--default" },
            { id: "search", componentName: "FilterBar", slotName: "search", storyId: "filter-bar--default" },
            { id: "input", componentName: "FilterBar", slotName: "input", storyId: "filter-bar--default" },
        ]);
        expect(findChain("icon").at(-1)).toEqual({ id: "search", componentName: "FilterBar", slotName: "search", storyId: "filter-bar--default" });
    });

    it("adds the interactive slots around the innermost one, so a SideNav item is a level of its label, icon, and chevron", () => {
        document.body.innerHTML = `
            <nav class="dextinitySideNav"><div class="dextinitySideNav__scroll"><div class="dextinitySideNav__group">
                <ul class="dextinitySideNav__list"><li class="dextinitySideNav__entry">
                    <button id="item" class="dextinitySideNav__item">
                        <span id="itemIcon" class="dextinitySideNav__itemIcon"><svg id="svg" class="dextinityIcon"></svg></span>
                        <span id="itemLabel" class="dextinitySideNav__itemLabel">Pages</span>
                        <svg id="itemChevron" class="dextinityIcon dextinitySideNav__itemChevron"></svg>
                    </button>
                </li></ul>
            </div></div></nav>`;
        const levelsOf = (id: string) => findChain(id).map(({ componentName, slotName }) => [componentName, slotName]);
        expect(levelsOf("itemLabel")).toEqual([
            ["SideNav", undefined],
            ["SideNav", "item"],
            ["SideNav", "itemLabel"],
        ]);
        expect(levelsOf("svg").slice(1)).toEqual([
            ["SideNav", "item"],
            ["SideNav", "itemIcon"],
        ]);
        expect(levelsOf("itemChevron").slice(1)).toEqual([
            ["SideNav", "item"],
            ["SideNav", "itemChevron"],
        ]);
        expect(levelsOf("item")).toEqual([
            ["SideNav", undefined],
            ["SideNav", "item"],
        ]);
    });

    it("leaves out slots of components outside the chain, slots above the innermost component, and slots on a component's root", () => {
        document.body.innerHTML = `
            <div class="dextinityFilterBar">
                <div class="dextinityFilterBar__actions">
                    <div class="dextinityInput dextinityFilterBar__field"><span id="unknown" class="dextinityUnknown__part"></span></div>
                </div>
            </div>`;
        expect(findChain("unknown").map(({ componentName, slotName }) => [componentName, slotName])).toEqual([
            ["FilterBar", undefined],
            ["Input", undefined],
        ]);

        document.body.innerHTML = `<div><span id="orphan" class="dextinityFilterBar__input"></span></div>`;
        expect(findChain("orphan")).toEqual([]);
    });
});

describe("getSlotLabel", () => {
    it("writes the slot's name as words in lowercase", () => {
        expect(getSlotLabel("input")).toBe("input");
        expect(getSlotLabel("startIcon")).toBe("start icon");
    });
});

describe("getLevelHint", () => {
    const levels = [{ componentName: "AppShell" }, { componentName: "FilterBar" }, { componentName: "FilterBar", slotName: "input" }];

    it("names the keys only while there are several levels", () => {
        expect(getLevelHint(levels, 1)).toBe("↑ ↓ level · click opens story");
        expect(getLevelHint(levels, 0)).toBe("↑ ↓ level · click opens story");
        expect(getLevelHint([{ componentName: "Button" }], 0)).toBe("click opens story");
    });

    it("says that a slot opens the story of the component it is part of", () => {
        expect(getLevelHint(levels, 2)).toBe("↑ ↓ level · part of FilterBar · click opens FilterBar");
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
