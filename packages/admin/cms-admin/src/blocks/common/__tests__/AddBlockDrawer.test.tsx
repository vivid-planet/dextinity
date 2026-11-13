import { StackPage, StackSwitch } from "@dextinity/admin";
import { createMemoryHistory } from "history";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Route, Router } from "react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import { BlockCategory, type BlockInterface } from "../../types";
import { AddBlockDrawer } from "../AddBlockDrawer";
import { BlockAdminComponentRoot } from "../BlockAdminComponentRoot";

function createTestBlock(block: Pick<BlockInterface, "name" | "displayName" | "category" | "iconName" | "description">): BlockInterface {
    return { ...createBlockSkeleton(), defaultValues: () => ({}), ...block };
}

const blocks: Record<string, BlockInterface> = {
    heading: createTestBlock({
        name: "Heading",
        displayName: "Heading",
        category: BlockCategory.TextAndContent,
        iconName: "heading",
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

    it("focuses the search field when opened and returns the focus to the add button when closed", async () => {
        function DrawerWithButton() {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <button onClick={() => setOpen(true)}>Add block</button>
                    <AddBlockDrawer open={open} onClose={() => setOpen(false)} blocks={blocks} onAddNewBlock={vi.fn()} />
                </>
            );
        }
        render(<DrawerWithButton />);
        const addButton = screen.getByRole("button", { name: "Add block" });
        addButton.focus();
        fireEvent.click(addButton);

        const search = screen.getByRole("searchbox", { name: "Search blocks" });
        await waitFor(() => expect(document.activeElement).toBe(search));

        fireEvent.keyDown(search, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        await waitFor(() => expect(document.activeElement).toBe(addButton));
    });

    it("finds blocks by their description and adds the first match on Enter", () => {
        const { onAddNewBlock } = renderDrawer();
        const search = screen.getByRole("searchbox", { name: "Search blocks" });

        fireEvent.change(search, { target: { value: "focal" } });
        expect(screen.queryByText("Heading")).toBeNull();

        fireEvent.keyDown(search, { key: "Enter" });
        expect(onAddNewBlock).toHaveBeenCalledWith("image", true);
    });

    it("tells where the new block is inserted, under the option to edit it after adding", () => {
        renderDrawer();
        const hint = screen.getByText("Will be inserted at the end of the list.");
        const editAfterAdding = screen.getByRole("checkbox", { name: "Edit the block after adding it" });
        expect(screen.getByRole("dialog", { name: "Add new block" }).getAttribute("aria-describedby")).toBe(hint.id);
        expect(editAfterAdding.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByRole("searchbox").compareDocumentPosition(editAfterAdding) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        cleanup();

        renderDrawer({ insertBefore: blocks.heading });
        expect(screen.getByText("Will be inserted before “Heading”.")).toBeTruthy();
    });

    it("adds the block without opening it when the option to edit it is unchecked", () => {
        const { onAddNewBlock } = renderDrawer();

        fireEvent.click(screen.getByRole("checkbox", { name: "Edit the block after adding it" }));
        fireEvent.click(screen.getByRole("button", { name: /Heading/ }));
        expect(onAddNewBlock).toHaveBeenCalledWith("heading", false);
    });

    it("names the root by what the blocks make up on the top level, and by its title when nested", () => {
        renderDrawerInPage("/page");
        expect(screen.getByText("Will be inserted at the end of the page.")).toBeTruthy();
        cleanup();

        renderDrawerInPage("/page/block-id/blocks");
        expect(screen.getByText("Will be inserted at the end of “Columns”.")).toBeTruthy();
    });
});

function renderDrawerInPage(initialEntry: string) {
    const history = createMemoryHistory({ initialEntries: [initialEntry] });
    const drawer = <AddBlockDrawer open onClose={vi.fn()} blocks={blocks} onAddNewBlock={vi.fn()} />;
    render(
        <Router history={history}>
            <Route path="/page">
                <BlockAdminComponentRoot title="Page" contentKind="page">
                    <StackSwitch>
                        <StackPage name="list">{drawer}</StackPage>
                        <StackPage name="blocks" title="Columns">
                            {drawer}
                        </StackPage>
                    </StackSwitch>
                </BlockAdminComponentRoot>
            </Route>
        </Router>,
    );
}
