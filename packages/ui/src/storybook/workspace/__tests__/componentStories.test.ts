import { describe, expect, it } from "vitest";

import { findComponentWithStory, getComponentNames, getComponentStoryIds } from "../componentStories";

const stories = [
    { id: "topbar--with-scope", title: "Shell/Top bar & scope/TopBar", name: "With Scope" },
    { id: "topbar--default", title: "Shell/Top bar & scope/TopBar", name: "Default" },
    { id: "avatar--sizes", title: "Building blocks/Status, tags & badges/Avatar", name: "Sizes" },
    { id: "avatar--colors", title: "Building blocks/Status, tags & badges/Avatar", name: "Colors" },
    { id: "toolbar--vertical", title: "Building blocks/Buttons/Toolbar", name: "Vertical" },
    { id: "patterns-toolbar--default", title: "Patterns/Toolbar", name: "Default" },
    { id: "icon-button--default", title: "Building blocks/Buttons/IconButton", name: "Default" },
    { id: "toolbar-button--default", title: "Building blocks/Buttons/ToolbarButton", name: "Default" },
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

describe("findComponentWithStory", () => {
    it("returns the closest component with a story, skipping components without one", () => {
        document.body.innerHTML = `
            <div class="dextinityTopBar">
                <div class="dextinityUnknownPart"><span id="target">Search</span></div>
            </div>`;
        const result = findComponentWithStory(document.getElementById("target"), getComponentStoryIds(stories));
        expect(result?.componentName).toBe("TopBar");
        expect(result?.storyId).toBe("topbar--default");
        expect(result?.element).toBe(document.querySelector(".dextinityTopBar"));
    });

    it("prefers the outer component when an element is the root of several", () => {
        document.body.innerHTML = `<button id="target" class="dextinityIconButton dextinityToolbarButton">B</button>`;
        expect(findComponentWithStory(document.getElementById("target"), getComponentStoryIds(stories))?.componentName).toBe("ToolbarButton");
    });
});
