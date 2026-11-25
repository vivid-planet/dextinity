import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryContext, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor, within } from "storybook/test";

import { Header } from "../../common/header/Header";
import { DextinityConfigProvider } from "../../config/DextinityConfigContext";
import type { DependencyInterface } from "../../dependencies/types";
import { CurrentUserContext, type CurrentUserInterface } from "../../userPermissions/hooks/currentUser";
import { SearchHeaderItem } from "../SearchHeaderItem";

const EmptyMenu = () => null;

function createDependency({ displayName, path }: { displayName: string; path: string }): DependencyInterface {
    return {
        displayName,
        resolvePath: async ({ id }) => `${path}/${id}/edit`,
    };
}

const currentUser: CurrentUserInterface = {
    id: "1",
    name: "Max Mustermann",
    email: "max@mustermann.com",
    impersonated: false,
    authenticatedUser: null,
    permissions: [{ permission: "fullTextSearch", contentScopes: [{ domain: "main", language: "en" }] }],
    allowedContentScopes: [],
};

const withSearchPermissionAndDependencies: Decorator = (Story) => (
    <DextinityConfigProvider
        graphQLApiUrl="/graphql"
        apiUrl=""
        adminUrl=""
        dependencies={{
            entityDependencyMap: {
                Page: createDependency({ displayName: "Page", path: "/pages" }),
                Link: createDependency({ displayName: "Link", path: "/pages" }),
                PageTreeNode: createDependency({ displayName: "Page tree node", path: "/pages" }),
                News: createDependency({ displayName: "News", path: "/news" }),
            },
        }}
    >
        <CurrentUserContext.Provider
            value={{ currentUser, isAllowed: (user, permission) => user.permissions.some((p) => p.permission === permission) }}
        >
            <Story />
        </CurrentUserContext.Provider>
    </DextinityConfigProvider>
);

const renderInMasterLayout: Decorator = (Story) => (
    <MasterLayout headerComponent={Story} menuComponent={EmptyMenu}>
        <MainContent>
            <Typography>Page content</Typography>
        </MainContent>
    </MasterLayout>
);

const config: Meta<typeof SearchHeaderItem> = {
    component: SearchHeaderItem,
    title: "fullTextSearch/SearchHeaderItem",
    decorators: [renderInMasterLayout, withSearchPermissionAndDependencies],
    beforeEach: () => {
        // The type settings are stored per user and would leak into the next story
        window.localStorage.clear();
    },
    render: () => (
        <Header>
            <SearchHeaderItem />
        </Header>
    ),
};

export default config;

type Story = StoryObj<typeof config>;

async function openSearchDialog({ canvas, userEvent }: Pick<StoryContext, "canvas" | "userEvent">) {
    await userEvent.click(await canvas.findByRole("button", { name: "Search" }));
    return screen.findByRole("dialog", { name: "Search" });
}

async function search({ dialog, userEvent, text }: { dialog: HTMLElement; userEvent: StoryContext["userEvent"]; text: string }) {
    await userEvent.type(within(dialog).getByRole("textbox", { name: "Search" }), text);
}

/**
 * Search for "ab" to see the results grouped by type, with highlighted titles and snippets and a tab per type.
 * The product result has no `entityDependencyMap` entry, so it can't be opened.
 */
export const Default: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        await step("Results are grouped by type", async () => {
            await search({ dialog, userEvent, text: "ab" });

            await waitFor(
                () => {
                    expect(within(dialog).getAllByRole("list")).toHaveLength(4);
                },
                { timeout: 3000 },
            );
            const [newsGroup, linkGroup, pageGroup, productGroup] = within(dialog).getAllByRole("list");
            expect(within(newsGroup).getByText("News")).toBeInTheDocument();
            expect(within(linkGroup).getByText("Link")).toBeInTheDocument();
            expect(within(pageGroup).getByText("Page")).toBeInTheDocument();
            expect(within(pageGroup).getByText("2")).toBeInTheDocument();
            expect(within(pageGroup).getAllByRole("button")).toHaveLength(2);
            expect(within(productGroup).getByText("Product")).toBeInTheDocument();
            expect(within(pageGroup).getAllByText("able")).toHaveLength(2);
            expect(dialog.querySelectorAll("mark").length).toBeGreaterThan(0);
        });

        await step("Selecting a tab shows only that type but keeps the counts", async () => {
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");

            await userEvent.click(within(dialog).getByRole("tab", { name: /^Link/ }));

            await waitFor(() => {
                expect(within(dialog).getAllByRole("list")).toHaveLength(1);
            });
            expect(within(dialog).getByText("Absolute")).toBeInTheDocument();
            expect(within(dialog).getByRole("tab", { name: /^Link/ })).toHaveAttribute("aria-selected", "true");
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");
            expect(within(dialog).getByRole("tab", { name: /^Page/ })).toHaveTextContent("Page2");
        });
    },
};

/** Types switched off in the settings are neither searched nor shown as a tab. */
export const ChooseWhatToSearch: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });
        await search({ dialog, userEvent, text: "ab" });
        await within(dialog).findByRole("tab", { name: /^Product/ }, { timeout: 3000 });

        await step("Switch off products", async () => {
            await userEvent.click(within(dialog).getByRole("button", { name: "Choose what to search" }));
            const settings = await screen.findByRole("dialog", { name: "Choose what to search" });
            await userEvent.click(within(settings).getByRole("switch", { name: "Product" }));
            await userEvent.keyboard("{Escape}");
        });

        await step("Products are no longer searched", async () => {
            await waitFor(() => {
                expect(within(dialog).queryByRole("tab", { name: /^Product/ })).not.toBeInTheDocument();
            });
            await waitFor(() => {
                expect(within(dialog).getAllByRole("list")).toHaveLength(3);
            });
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All4");
        });
    },
};

/** Ctrl+K opens the dialog with the focus in the search input. Escape clears the search first and closes the dialog when there's nothing left to clear. */
export const KeyboardShortcuts: Story = {
    play: async ({ userEvent, step }) => {
        await step("Ctrl+K opens the dialog", async () => {
            await userEvent.keyboard("{Control>}k{/Control}");
            expect(await screen.findByRole("dialog", { name: "Search" })).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus();
            });
        });

        await step("Escape clears the search", async () => {
            const searchInput = screen.getByRole("textbox", { name: "Search" });
            await userEvent.keyboard("ab");
            expect(searchInput).toHaveValue("ab");
            await userEvent.keyboard("{Escape}");

            expect(searchInput).toHaveValue("");
            expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
        });

        await step("Escape closes the empty dialog", async () => {
            await userEvent.keyboard("{Escape}");

            await waitFor(() => {
                expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
            });
        });
    },
};

export const NoResults: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });
        await search({ dialog, userEvent, text: "nothing" });

        expect(await within(dialog).findByText("Check the spelling or try a shorter search term.", {}, { timeout: 3000 })).toBeInTheDocument();
        expect(within(dialog).getByText("nothing")).toBeInTheDocument();
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });
        await search({ dialog, userEvent, text: "error" });

        expect(await within(dialog).findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};
