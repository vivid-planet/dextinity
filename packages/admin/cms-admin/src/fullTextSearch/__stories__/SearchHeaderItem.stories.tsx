import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryContext, StoryObj } from "@storybook/react-vite";
import { useLocation } from "react-router";
import { expect, screen, waitFor, within } from "storybook/test";

import { Header } from "../../common/header/Header";
import { DextinityConfigProvider } from "../../config/DextinityConfigContext";
import type { EntityInterface } from "../../entities/types";
import { CurrentUserContext, type CurrentUserInterface } from "../../userPermissions/hooks/currentUser";
import { SearchHeaderItem } from "../SearchHeaderItem";

const EmptyMenu = () => null;

function CurrentPath() {
    const location = useLocation();
    return <Typography data-testid="current-path">{location.pathname}</Typography>;
}

function createEntity({ displayName, path }: { displayName: string; path: string }): EntityInterface {
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

const withSearchPermissionAndEntities: Decorator = (Story) => (
    <DextinityConfigProvider
        graphQLApiUrl="/graphql"
        apiUrl=""
        adminUrl=""
        entities={{
            Page: createEntity({ displayName: "Page", path: "/pages" }),
            Link: createEntity({ displayName: "Link", path: "/pages" }),
            PredefinedPage: createEntity({ displayName: "Predefined page", path: "/pages" }),
            PageTreeNode: createEntity({ displayName: "Page tree node", path: "/pages" }),
            News: createEntity({ displayName: "News", path: "/news" }),
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
            <CurrentPath />
        </MainContent>
    </MasterLayout>
);

const config: Meta<typeof SearchHeaderItem> = {
    component: SearchHeaderItem,
    title: "fullTextSearch/SearchHeaderItem",
    decorators: [renderInMasterLayout, withSearchPermissionAndEntities],
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
    await userEvent.type(within(dialog).getByRole("combobox", { name: "Search" }), text);
}

/** Before the first search, the dialog shows a tab for every type the user can search, without counts. */
export const EmptySearch: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        expect(within(dialog).getByText("Start typing to search")).toBeInTheDocument();
        expect(within(dialog).getByText("The last word also matches the beginning of a word.")).toBeInTheDocument();
        await waitFor(() => {
            expect(
                within(dialog)
                    .getAllByRole("tab")
                    .map((tab) => tab.textContent),
            ).toEqual(["All", "Page", "Link", "Predefined page", "News", "Product"]);
        });
    },
};

/**
 * Search for "ab" to see the results grouped by type, each group with the number of results of its type.
 * The search terms are marked in the names and in the snippets of the content.
 * The product result isn't registered in `entities`, so it can't be opened.
 */
export const Default: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        await step("Results are grouped by type", async () => {
            await search({ dialog, userEvent, text: "ab" });

            await waitFor(
                () => {
                    expect(within(dialog).getAllByRole("group")).toHaveLength(4);
                },
                { timeout: 3000 },
            );
            const groupsInExpectedOrder = ["News", "Link", "Page", "Product"].map((name) => within(dialog).getByRole("group", { name }));
            expect(within(dialog).getAllByRole("group")).toEqual(groupsInExpectedOrder);
            const pageGroup = within(dialog).getByRole("group", { name: "Page" });
            expect(pageGroup.parentElement).toHaveTextContent(/^Page2/);
            const homeResult = within(pageGroup).getByRole("option", { name: /Home/ });
            expect(homeResult).toHaveTextContent(
                "… Our team builds products that are able to grow with your business and adapt to new requirements. …",
            );
            expect(within(homeResult).getByText("able", { selector: "mark" })).toBeInTheDocument();
            expect(within(within(dialog).getByRole("group", { name: "Product" })).getByRole("option")).toHaveAttribute("aria-disabled", "true");
        });

        await step("Selecting a tab shows only that type but keeps the counts", async () => {
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");

            await userEvent.click(within(dialog).getByRole("tab", { name: /^Link/ }));

            await waitFor(() => {
                expect(within(dialog).getAllByRole("group")).toHaveLength(1);
            });
            expect(within(dialog).getByRole("tab", { name: /^Link/ })).toHaveAttribute("aria-selected", "true");
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");
            expect(within(dialog).getByRole("tab", { name: /^Page/ })).toHaveTextContent("Page2");
        });

        await step("A type without results has a tab with 0 results", async () => {
            const predefinedPageTab = within(dialog).getByRole("tab", { name: /^Predefined page/ });
            expect(predefinedPageTab).toHaveTextContent("Predefined page0");

            await userEvent.click(predefinedPageTab);

            expect(await within(dialog).findByText("Check the spelling or try a shorter search term.")).toBeInTheDocument();
        });

        await step("Clicking a result opens it", async () => {
            await userEvent.click(within(dialog).getByRole("tab", { name: /^All/ }));
            const pageGroup = await within(dialog).findByRole("group", { name: "Page" });

            await userEvent.click(within(pageGroup).getByRole("option", { name: /Contact/ }));

            await waitFor(() => {
                expect(canvas.getByTestId("current-path")).toHaveTextContent("/pages/4/edit");
            });
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
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });
        await search({ dialog, userEvent, text: "error" });

        expect(await within(dialog).findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};

/** Ctrl+K opens the dialog with the focus in the search input and closes it again. Escape clears the search first, then closes the dialog. */
export const KeyboardShortcuts: Story = {
    play: async ({ userEvent, step }) => {
        await step("Ctrl+K opens the dialog", async () => {
            await userEvent.keyboard("{Control>}k{/Control}");
            const dialog = await screen.findByRole("dialog", { name: "Search" });
            await waitFor(() => {
                expect(within(dialog).getByRole("combobox", { name: "Search" })).toHaveFocus();
            });
        });

        await step("Escape clears the search, a second Escape closes the dialog", async () => {
            await userEvent.keyboard("ab");
            const searchInput = within(screen.getByRole("dialog", { name: "Search" })).getByRole("combobox", { name: "Search" });
            expect(searchInput).toHaveValue("ab");

            await userEvent.keyboard("{Escape}");
            expect(searchInput).toHaveValue("");
            expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();

            await userEvent.keyboard("{Escape}");

            await waitFor(() => {
                expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
            });
        });

        await step("Ctrl+K closes the open dialog", async () => {
            await userEvent.keyboard("{Control>}k{/Control}");
            expect(await screen.findByRole("dialog", { name: "Search" })).toBeInTheDocument();

            await userEvent.keyboard("{Control>}k{/Control}");
            await waitFor(() => {
                expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
            });
        });
    },
};

/**
 * The search follows the WAI-ARIA combobox pattern: the focus stays in the input, the arrow keys move the active result across the groups,
 * and Enter opens it.
 */
export const KeyboardNavigation: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const currentPath = canvas.getByTestId("current-path");
        const initialPath = currentPath.textContent ?? "";
        const dialog = await openSearchDialog({ canvas, userEvent });
        const searchInput = within(dialog).getByRole("combobox", { name: "Search" });

        const expectActiveOption = (option: HTMLElement) => {
            expect(searchInput).toHaveAttribute("aria-activedescendant", option.id);
            expect(option).toHaveAttribute("aria-selected", "true");
            expect(within(dialog).getAllByRole("option", { selected: true })).toEqual([option]);
            expect(searchInput).toHaveFocus();
        };

        await step("The input controls the results listbox", async () => {
            expect(searchInput).toHaveAttribute("aria-expanded", "false");

            await search({ dialog, userEvent, text: "ab" });

            const listbox = await within(dialog).findByRole("listbox", { name: "Search results" }, { timeout: 3000 });
            expect(searchInput).toHaveAttribute("aria-expanded", "true");
            expect(searchInput).toHaveAttribute("aria-controls", listbox.id);
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
        });

        await step("ArrowDown and ArrowUp move the active result across the groups and wrap around", async () => {
            const options = within(dialog).getAllByRole("option");
            expect(options).toHaveLength(5);

            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(options[0]);

            await userEvent.keyboard("{ArrowDown}{ArrowDown}");
            expectActiveOption(options[2]);
            expect(within(dialog).getByRole("group", { name: "Page" })).toContainElement(options[2]);

            await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
            expectActiveOption(options[0]);

            await userEvent.keyboard("{ArrowUp}");
            expectActiveOption(options[4]);
        });

        await step("Enter on a result that can't be opened does nothing", async () => {
            const productOption = within(dialog).getAllByRole("option")[4];
            expect(productOption).toHaveAttribute("aria-disabled", "true");

            await userEvent.keyboard("{Enter}");

            expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
            expect(currentPath).toHaveTextContent(initialPath);
        });

        await step("Hovering a result makes it the active one", async () => {
            const options = within(dialog).getAllByRole("option");
            await userEvent.hover(options[1]);
            expectActiveOption(options[1]);
        });

        await step("Changing the search resets the active result", async () => {
            await userEvent.keyboard("c");
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
            await userEvent.keyboard("{Backspace}");
            await waitFor(
                () => {
                    expect(within(dialog).queryByRole("progressbar")).not.toBeInTheDocument();
                },
                { timeout: 3000 },
            );
        });

        await step("Enter opens the active result and closes the dialog", async () => {
            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(within(dialog).getAllByRole("option")[0]);

            await userEvent.keyboard("{Enter}");

            await waitFor(() => {
                expect(currentPath).toHaveTextContent(/\/news\/1\/edit$/);
            });
            await waitFor(() => {
                expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
            });
        });
    },
};
