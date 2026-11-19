import { describe, expect, it } from "vitest";

import { buildStoryTree, getStoryFolderIds } from "../storyTree";

const stories = [
    { id: "workspace-canvas--current", title: "Workspace/Canvas", name: "Current" },
    { id: "buttons-button--default", title: "Building blocks/Buttons/Button", name: "Default" },
    { id: "buttons-button--disabled", title: "Building blocks/Buttons/Button", name: "Disabled" },
    { id: "buttons-icon-button--default", title: "Building blocks/Buttons/IconButton", name: "Default" },
];

describe("buildStoryTree", () => {
    it("nests the stories by the segments of their title, in the order of the index, and counts the stories in each folder", () => {
        expect(buildStoryTree(stories)).toEqual([
            {
                id: "folder:Workspace",
                label: "Workspace",
                type: "folder",
                count: 1,
                children: [
                    {
                        id: "folder:Workspace/Canvas",
                        label: "Canvas",
                        type: "folder",
                        count: 1,
                        children: [{ id: "workspace-canvas--current", label: "Current", type: "page" }],
                    },
                ],
            },
            {
                id: "folder:Building blocks",
                label: "Building blocks",
                type: "folder",
                count: 3,
                children: [
                    {
                        id: "folder:Building blocks/Buttons",
                        label: "Buttons",
                        type: "folder",
                        count: 3,
                        children: [
                            {
                                id: "folder:Building blocks/Buttons/Button",
                                label: "Button",
                                type: "folder",
                                count: 2,
                                children: [
                                    { id: "buttons-button--default", label: "Default", type: "page" },
                                    { id: "buttons-button--disabled", label: "Disabled", type: "page" },
                                ],
                            },
                            {
                                id: "folder:Building blocks/Buttons/IconButton",
                                label: "IconButton",
                                type: "folder",
                                count: 1,
                                children: [{ id: "buttons-icon-button--default", label: "Default", type: "page" }],
                            },
                        ],
                    },
                ],
            },
        ]);
    });
});

describe("getStoryFolderIds", () => {
    it("returns the folders around a story, outermost first", () => {
        expect(getStoryFolderIds(stories[1])).toEqual([
            "folder:Building blocks",
            "folder:Building blocks/Buttons",
            "folder:Building blocks/Buttons/Button",
        ]);
    });
});
