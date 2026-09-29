import { describe, expect, it } from "vitest";

import { BlockMigration } from "../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../migrations/types";
import { createExternalLinkBlock } from "./create-external-link.block";
import { ExternalLinkBlock } from "./external-link.block";

function fieldNames(block: ReturnType<typeof createExternalLinkBlock>) {
    return {
        fields: block.blockMeta.fields.map((field) => field.name),
        inputFields: block.blockInputMeta.fields.map((field) => field.name),
    };
}

describe("createExternalLinkBlock", () => {
    it("should use the given name", () => {
        expect(createExternalLinkBlock({}, "UrlOnlyLink").name).toBe("UrlOnlyLink");
    });

    it("should offer both options by default", () => {
        expect(fieldNames(createExternalLinkBlock({}, "DefaultLink"))).toEqual({
            fields: ["targetUrl", "openInNewWindow", "noFollow"],
            inputFields: ["targetUrl", "openInNewWindow", "noFollow"],
        });
    });

    it("should not have a field for an option that is left out", () => {
        expect(fieldNames(createExternalLinkBlock({ supports: [] }, "UrlLink"))).toEqual({
            fields: ["targetUrl"],
            inputFields: ["targetUrl"],
        });

        expect(fieldNames(createExternalLinkBlock({ supports: ["noFollow"] }, "NoFollowLink"))).toEqual({
            fields: ["targetUrl", "noFollow"],
            inputFields: ["targetUrl", "noFollow"],
        });
    });

    it("should keep the field order stable regardless of how supports is ordered", () => {
        expect(fieldNames(createExternalLinkBlock({ supports: ["noFollow", "openInNewWindow"] }, "ReorderedLink")).fields).toEqual([
            "targetUrl",
            "openInNewWindow",
            "noFollow",
        ]);
    });

    it("should not leak fields between blocks created by separate calls", () => {
        createExternalLinkBlock({ supports: [] }, "FirstLink");

        expect(fieldNames(createExternalLinkBlock({}, "SecondLink")).fields).toEqual(["targetUrl", "openInNewWindow", "noFollow"]);
    });

    it("should transform the input to block data", () => {
        const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "TransformingLink");

        expect(UrlLinkBlock.blockInputFactory({ targetUrl: "https://www.example.com" }).transformToBlockData().transformToSave()).toMatchObject({
            targetUrl: "https://www.example.com",
        });
    });

    it("should reject a name that is already registered", () => {
        createExternalLinkBlock({ supports: [] }, "TakenLink");

        expect(() => createExternalLinkBlock({ supports: [] }, "TakenLink")).toThrow(/already registered/);
        expect(() => createExternalLinkBlock({ supports: [] }, ExternalLinkBlock.name)).toThrow(/already registered/);
    });

    describe("content stored by ExternalLinkBlock", () => {
        const stored = { targetUrl: "https://www.example.com", openInNewWindow: true, noFollow: true, $$version: 1 };

        it("should pass on only the fields the block has", async () => {
            const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "StoredUrlLink");

            expect(await UrlLinkBlock.blockDataFactory({ ...stored }).transformToPlain()).toEqual({ targetUrl: "https://www.example.com" });
        });

        it("should keep the stored values of options that are left out until the block is saved again", () => {
            const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "KeepingUrlLink");

            expect(UrlLinkBlock.blockDataFactory({ ...stored }).transformToSave()).toEqual({
                targetUrl: "https://www.example.com",
                openInNewWindow: true,
                noFollow: true,
                $$vendorVersion: 1,
            });
        });

        it("should apply the block's own migrations starting at version 1", async () => {
            class RemoveLinkOptionsMigration
                extends BlockMigration<(from: typeof stored) => { targetUrl?: string }>
                implements BlockMigrationInterface
            {
                public readonly toVersion = 1;

                protected migrate({ targetUrl }: typeof stored) {
                    return { targetUrl };
                }
            }

            const UrlLinkBlock = createExternalLinkBlock(
                { supports: [] },
                { name: "MigratedUrlLink", migrate: { version: 1, migrations: [RemoveLinkOptionsMigration] } },
            );

            expect(UrlLinkBlock.blockDataFactory({ ...stored }).transformToSave()).toEqual({
                targetUrl: "https://www.example.com",
                $$version: 1,
                $$vendorVersion: 1,
            });
        });

        it("should add noFollow to content stored before it existed", async () => {
            const NoFollowLinkBlock = createExternalLinkBlock({ supports: ["noFollow"] }, "LegacyNoFollowLink");

            expect(
                await NoFollowLinkBlock.blockDataFactory({ targetUrl: "https://www.example.com", openInNewWindow: true }).transformToPlain(),
            ).toEqual({
                targetUrl: "https://www.example.com",
                noFollow: false,
            });
        });
    });

    it("should leave options that are left out out of the block data created from the input", () => {
        const UrlLinkBlock = createExternalLinkBlock({ supports: [] }, "InputUrlLink");

        expect(
            UrlLinkBlock.blockInputFactory({ targetUrl: "https://www.example.com", openInNewWindow: true } as never)
                .transformToBlockData()
                .transformToSave(),
        ).toEqual({ targetUrl: "https://www.example.com", $$vendorVersion: 1 });
    });
});
