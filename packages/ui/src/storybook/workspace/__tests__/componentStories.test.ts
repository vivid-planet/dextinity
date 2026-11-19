import { describe, expect, it } from "vitest";

import { findComponentWithStory, getComponentName, getComponentStoryIds } from "../componentStories";

const stories = [
    { id: "topbar--with-scope", title: "Shell/Top bar & scope/TopBar", name: "With Scope" },
    { id: "topbar--default", title: "Shell/Top bar & scope/TopBar", name: "Default" },
    { id: "avatar--sizes", title: "Building blocks/Status, tags & badges/Avatar", name: "Sizes" },
    { id: "avatar--colors", title: "Building blocks/Status, tags & badges/Avatar", name: "Colors" },
    { id: "toolbar--vertical", title: "Building blocks/Buttons/Toolbar", name: "Vertical" },
    { id: "patterns-toolbar--default", title: "Patterns/Toolbar", name: "Default" },
];

describe("getComponentStoryIds", () => {
    it("prefers a component's Default story, falls back to its first one, and skips pattern pages of the same name", () => {
        expect(getComponentStoryIds(stories)).toEqual(
            new Map([
                ["TopBar", "topbar--default"],
                ["Avatar", "avatar--sizes"],
                ["Toolbar", "toolbar--vertical"],
            ]),
        );
    });
});

describe("getComponentName", () => {
    it("reads the component from its root class, ignoring slot classes, the theme, and icons", () => {
        const element = document.createElement("div");
        element.className = "dextinityTopBar__search other";
        expect(getComponentName(element)).toBeUndefined();

        element.className = "dextinityTheme";
        expect(getComponentName(element)).toBeUndefined();

        element.className = "dextinityIcon";
        expect(getComponentName(element)).toBeUndefined();

        element.className = "dextinityTopBar";
        expect(getComponentName(element)).toBe("TopBar");
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
});
