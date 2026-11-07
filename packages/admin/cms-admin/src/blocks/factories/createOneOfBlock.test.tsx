import { RouterMemoryRouter } from "@dextinity/admin";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BlockContext } from "../context/BlockContext";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory } from "../types";
import { createOneOfBlock } from "./createOneOfBlock";

afterEach(cleanup);

describe("createOneOfBlock", () => {
    const TestBlock = {
        ...createBlockSkeleton(),
        category: BlockCategory.TextAndContent,
        name: "title",
        displayName: "Title",
        defaultValues: () => ({}),
    };

    it("should override block's values", () => {
        const nameOverride = "override name";
        const block = createOneOfBlock(
            {
                name: "testBlocksBlock",
                displayName: "Test List Block",
                supportedBlocks: { TestContentBlock: TestBlock },
            },
            (block) => {
                block.name = nameOverride;
                return block;
            },
        );
        expect(block.name).toBe(nameOverride);
    });

    it("should name the attached types when activeType has no entry in attachedBlocks", () => {
        const block = createOneOfBlock({
            name: "testOneOfBlock",
            displayName: "Test One Of Block",
            supportedBlocks: { internal: TestBlock, external: TestBlock },
        });

        expect(() => block.previewContent({ attachedBlocks: [{ type: "internal", props: {} }], activeType: "external" }, {} as BlockContext)).toThrow(
            'activeType "external" has no entry in attachedBlocks, which holds: "internal".',
        );
        expect(() => block.previewContent({ attachedBlocks: [], activeType: "external" }, {} as BlockContext)).toThrow(
            'activeType "external" has no entry in attachedBlocks, which is empty.',
        );
    });

    const supportedBlocks = { image: { ...TestBlock, displayName: "Image" }, video: { ...TestBlock, displayName: "Video" } };

    function renderAdminComponent(variant: "select" | "radio" | "toggle", activeType: string | undefined, updateState = vi.fn()) {
        const block = createOneOfBlock({ name: "testOneOfBlock", supportedBlocks, variant, label: "Media type" });
        const state = { attachedBlocks: activeType ? [{ type: activeType, props: {} }] : [], activeType };
        render(
            <RouterMemoryRouter>
                <block.AdminComponent state={state} updateState={updateState} />
            </RouterMemoryRouter>,
        );
        return updateState;
    }

    it("chooses the block with a select", async () => {
        const updateState = renderAdminComponent("select", "image");

        const select = screen.getByRole("combobox", { name: /Media type/ });
        expect(select.textContent).toContain("Image");

        const user = userEvent.setup();
        await user.click(select);
        await user.click(await screen.findByRole("option", { name: "Video" }));

        await waitFor(() => expect(updateState).toHaveBeenCalled());
        const setState = updateState.mock.calls[0][0];
        expect(setState({ attachedBlocks: [{ type: "image", props: {} }], activeType: "image" })).toEqual({
            attachedBlocks: [{ type: "video", props: {} }],
            activeType: "video",
        });
    });

    it("offers no block with allowEmpty in radios", () => {
        renderAdminComponent("radio", undefined);

        expect(screen.getByRole("radiogroup", { name: "Media type" })).toBeTruthy();
        expect((screen.getByRole("radio", { name: "None" }) as HTMLInputElement).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByRole("radio", { name: "Image" })).toBeTruthy();
    });

    it("chooses the block with a segmented control", async () => {
        const updateState = renderAdminComponent("toggle", "image");

        expect(screen.getByRole("radiogroup", { name: "Media type" })).toBeTruthy();
        expect(screen.getByRole("radio", { name: "Image" }).getAttribute("aria-checked")).toBe("true");

        const user = userEvent.setup();
        await user.click(screen.getByRole("radio", { name: "Video" }));

        await waitFor(() => expect(updateState).toHaveBeenCalled());
    });
});
