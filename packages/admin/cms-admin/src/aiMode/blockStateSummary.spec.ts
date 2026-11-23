import { describe, expect, it } from "vitest";

import type { BlockInterface } from "../blocks/types";
import { summarizeBlockStateForAiMode, summarizeSeoBlockStateForAiMode } from "./blockStateSummary";

const contentBlock = { extractTextContents: () => ["Hello"] } as unknown as BlockInterface;

const linkState = (activeType: string, attachedBlocks: { type: string; props: unknown }[]) => ({ attachedBlocks, activeType, block: {} });

describe("summarizeBlockStateForAiMode", () => {
    it("outlines the blocks by key and type, marking hidden ones, with the text contents of the block", () => {
        const state = {
            blocks: [
                { key: "a", type: "text", visible: true, props: {} },
                {
                    key: "b",
                    type: "contentGroup",
                    visible: false,
                    props: { content: { blocks: [{ key: "c", type: "divider", visible: true, props: {} }] } },
                },
            ],
        };

        expect(summarizeBlockStateForAiMode(contentBlock, state)).toEqual({
            blocks: [
                { key: "a", type: "text" },
                { key: "b", type: "contentGroup", hidden: true, blocks: [{ key: "c", type: "divider" }] },
            ],
            textContents: ["Hello"],
        });
    });

    it("attaches the files and links a block references to that block, once each", () => {
        const state = {
            blocks: [
                {
                    key: "a",
                    type: "image",
                    visible: true,
                    props: { damFile: { id: "file-1", name: "header.jpg" }, alternative: { damFile: { id: "file-1", name: "header.jpg" } } },
                },
                {
                    key: "b",
                    type: "button",
                    visible: true,
                    props: { link: linkState("external", [{ type: "external", props: { targetUrl: "https://example.com" } }]) },
                },
                {
                    key: "c",
                    type: "button",
                    visible: true,
                    props: { link: linkState("email", [{ type: "email", props: { email: "info@example.com" } }]) },
                },
                { key: "d", type: "button", visible: true, props: { link: linkState("phone", [{ type: "phone", props: { phone: "+43 1 234" } }]) } },
            ],
        };

        expect(summarizeBlockStateForAiMode(contentBlock, state).blocks).toEqual([
            { key: "a", type: "image", files: [{ id: "file-1", name: "header.jpg" }] },
            { key: "b", type: "button", links: [{ url: "https://example.com" }] },
            { key: "c", type: "button", links: [{ email: "info@example.com" }] },
            { key: "d", type: "button", links: [{ phone: "+43 1 234" }] },
        ]);
    });

    it("leaves out the link of a variant that is not the active one", () => {
        const state = {
            blocks: [
                {
                    key: "a",
                    type: "button",
                    visible: true,
                    props: {
                        link: linkState("email", [
                            { type: "external", props: { targetUrl: "https://example.com" } },
                            { type: "email", props: { email: "info@example.com" } },
                        ]),
                    },
                },
            ],
        };

        expect(summarizeBlockStateForAiMode(contentBlock, state).blocks).toEqual([
            { key: "a", type: "button", links: [{ email: "info@example.com" }] },
        ]);
    });

    it("attaches the pages an internal link points to and the videos a block embeds", () => {
        const state = {
            blocks: [
                {
                    key: "a",
                    type: "teaser",
                    visible: true,
                    props: {
                        link: linkState("internal", [
                            { type: "internal", props: { targetPage: { id: "node-1", name: "About us", path: "/about-us" } } },
                        ]),
                    },
                },
                { key: "b", type: "media", visible: true, props: { youtubeIdentifier: "dQw4w9WgXcQ" } },
            ],
        };

        expect(summarizeBlockStateForAiMode(contentBlock, state).blocks).toEqual([
            { key: "a", type: "teaser", links: [{ pageTreeNodeId: "node-1", name: "About us", path: "/about-us" }] },
            { key: "b", type: "media", videos: [{ platform: "youtube", identifier: "dQw4w9WgXcQ" }] },
        ]);
    });
});

describe("summarizeSeoBlockStateForAiMode", () => {
    it("adds the SEO settings that are set, which the SEO block has no text contents for", () => {
        const seoBlock = {} as BlockInterface;

        expect(
            summarizeSeoBlockStateForAiMode(seoBlock, { htmlTitle: "About us", metaDescription: "", noIndex: false, alternativeLinks: [] }),
        ).toMatchObject({
            htmlTitle: "About us",
            noIndex: false,
        });
        expect(summarizeSeoBlockStateForAiMode(seoBlock, { metaDescription: "" })).not.toHaveProperty("metaDescription");
    });
});
