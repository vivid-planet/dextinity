import { FormattedMessage } from "react-intl";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface } from "../../types";
import { AddBlockDrawer } from "../AddBlockDrawer";

function createTestBlock(block: Pick<BlockInterface, "name" | "displayName" | "category" | "iconName" | "description">): BlockInterface {
    return { ...createBlockSkeleton(), defaultValues: () => ({}), ...block };
}

const blocks: Record<string, BlockInterface> = {
    heading: createTestBlock({
        name: "Heading",
        displayName: "Heading",
        category: BlockCategory.TextAndContent,
        iconName: "rte-heading",
        description: <FormattedMessage id="test.heading.description" defaultMessage="Title for a section" />,
    }),
    image: createTestBlock({
        name: "Image",
        displayName: "Image",
        category: BlockCategory.Media,
        description: "Image with focal point and crop",
    }),
};

function renderDrawer(props: Partial<Parameters<typeof AddBlockDrawer>[0]> = {}) {
    const onAddNewBlock = vi.fn();
    render(<AddBlockDrawer open onClose={vi.fn()} blocks={blocks} onAddNewBlock={onAddNewBlock} {...props} />);
    return { onAddNewBlock };
}

afterEach(() => {
    cleanup();
    window.localStorage.clear();
});

describe("AddBlockDrawer", () => {
    it("lists the blocks with their descriptions under their categories, without category filters", () => {
        renderDrawer();

        expect(screen.getByRole("heading", { name: "Text & Content" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Media" })).toBeTruthy();
        expect(screen.getByText("Title for a section")).toBeTruthy();
        expect(screen.getByText("Image with focal point and crop")).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Categories" })).toBeNull();
    });

    it("finds blocks by their description and adds the first match on Enter", () => {
        const { onAddNewBlock } = renderDrawer();
        const search = screen.getByRole("searchbox", { name: "Search blocks" });

        fireEvent.change(search, { target: { value: "focal" } });
        expect(screen.queryByText("Heading")).toBeNull();

        fireEvent.keyDown(search, { key: "Enter" });
        expect(onAddNewBlock).toHaveBeenCalledWith("image", true);
    });

    it("tells where the new block is inserted", () => {
        renderDrawer();
        expect(screen.getByText("Will be inserted at the end of the list.")).toBeTruthy();
        cleanup();

        renderDrawer({ insertBefore: blocks.heading });
        expect(screen.getByText("Will be inserted before “Heading”.")).toBeTruthy();
    });
});
