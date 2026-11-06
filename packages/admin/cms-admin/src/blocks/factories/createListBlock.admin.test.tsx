import { RouterMemoryRouter, Stack } from "@dextinity/admin";
import { Dialog, MenuItem } from "@dextinity/ui";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { cleanup, render, screen, waitFor, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockCategory, type BlockState } from "../types";
import { createListBlock } from "./createListBlock";

vi.mock("../../config/DextinityConfigContext", () => ({ useDextinityConfig: () => ({ apiUrl: "https://example.com", dam: { scopeParts: [] } }) }));
vi.mock("../../contentScope/Provider", () => ({ useContentScope: () => ({ scope: {} }) }));
vi.mock("../context/useBlockContext", () => ({ useBlockContext: () => ({}) }));

afterEach(cleanup);

const TeaserBlock = {
    ...createBlockSkeleton(),
    category: BlockCategory.Teaser,
    name: "Teaser",
    displayName: "Teaser",
    defaultValues: () => ({ title: "" }),
    previewContent: (state: { title: string }) => [{ type: "text" as const, content: state.title }],
};

const ListBlock = createListBlock({
    name: "TeaserList",
    displayName: "Teasers",
    block: TeaserBlock,
    AdditionalItemContextMenuItems: ({ openDialog }) => (
        <MenuItem
            label="Visibility rules"
            onClick={() =>
                openDialog((close) => (
                    <Dialog open onOpenChange={close} title="Visibility rules">
                        Rules
                    </Dialog>
                ))
            }
        />
    ),
});

function TeaserList() {
    const [state, setState] = useState<BlockState<typeof ListBlock>>({
        blocks: ["First teaser", "Second teaser"].map((title) => ({ key: title, visible: true, selected: false, slideIn: false, props: { title } })),
    });
    return <ListBlock.AdminComponent state={state} updateState={setState} />;
}

function rowTitles() {
    return within(screen.getByRole("list", { name: "Teasers" }))
        .getAllByRole("button", { name: /teaser/ })
        .map((button) => button.textContent);
}

describe("createListBlock admin component", () => {
    it("deletes an item from its menu and restores it with undo", async () => {
        render(
            <RouterMemoryRouter>
                <Stack topLevelTitle="Page">
                    <TeaserList />
                </Stack>
            </RouterMemoryRouter>,
        );
        const user = userEvent.setup();

        expect(rowTitles()).toEqual(["First teaserTeaser", "Second teaserTeaser"]);

        await user.click(screen.getAllByRole("button", { name: "More actions" })[0]);
        await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

        await waitFor(() => expect(rowTitles()).toEqual(["Second teaserTeaser"]));
        expect(screen.getByText("Block deleted")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(rowTitles()).toEqual(["First teaserTeaser", "Second teaserTeaser"]));
    });

    it("restores bulk-deleted items unselected with undo", async () => {
        render(
            <RouterMemoryRouter>
                <Stack topLevelTitle="Page">
                    <TeaserList />
                </Stack>
            </RouterMemoryRouter>,
        );
        const user = userEvent.setup();

        await user.click(screen.getByRole("checkbox", { name: "Select all" }));
        await user.click(screen.getByRole("button", { name: "Delete" }));
        expect(await screen.findByText("2 blocks deleted")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(rowTitles()).toEqual(["First teaserTeaser", "Second teaserTeaser"]));
        expect(screen.getByRole("checkbox", { name: "Select all" }).getAttribute("aria-checked")).toBe("false");
    });

    it("keeps the dialog of an additional menu item open after the menu closes", async () => {
        render(
            <RouterMemoryRouter>
                <Stack topLevelTitle="Page">
                    <TeaserList />
                </Stack>
            </RouterMemoryRouter>,
        );
        const user = userEvent.setup();

        await user.click(screen.getAllByRole("button", { name: "More actions" })[1]);
        await user.click(await screen.findByRole("menuitem", { name: "Visibility rules" }));

        expect(await screen.findByRole("dialog", { name: "Visibility rules" })).toBeTruthy();
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
        expect(screen.getByRole("dialog", { name: "Visibility rules" })).toBeTruthy();
    });
});
