import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryContext, StoryObj } from "@storybook/react-vite";
import { useLocation } from "react-router";
import { expect, screen, waitFor, within } from "storybook/test";

import { Header } from "../../common/header/Header";
import { DextinityConfigProvider } from "../../config/DextinityConfigContext";
import type { DependencyInterface } from "../../dependencies/types";
import { CurrentUserContext, type CurrentUserInterface } from "../../userPermissions/hooks/currentUser";
import { SearchHeaderItem } from "../SearchHeaderItem";

const EmptyMenu = () => null;

function CurrentPath() {
    const location = useLocation();
    return <Typography data-testid="current-path">{location.pathname}</Typography>;
}

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
                PredefinedPage: createDependency({ displayName: "Predefined page", path: "/pages" }),
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
            <CurrentPath />
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
    await userEvent.type(within(dialog).getByRole("combobox", { name: "Search" }), text);
}

/** The empty dialog keeps its height and shows a tab for every type that can be searched, without counts. */
export const EmptySearch: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        expect(await within(dialog).findByText("Search Link, Page and more")).toBeInTheDocument();
        expect(within(dialog).getByText("The last word also matches the beginning of a word.")).toBeInTheDocument();
        expect(
            within(dialog)
                .getAllByRole("tab")
                .map((tab) => tab.textContent),
        ).toEqual(["All", "Link", "Page", "Predefined page", "News", "Product"]);
    },
};

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
                    expect(within(dialog).getAllByRole("group")).toHaveLength(4);
                },
                { timeout: 3000 },
            );
            const groupsInExpectedOrder = ["News", "Link", "Page", "Product"].map((name) => within(dialog).getByRole("group", { name }));
            expect(within(dialog).getAllByRole("group")).toEqual(groupsInExpectedOrder);
            const pageGroup = within(dialog).getByRole("group", { name: "Page" });
            expect(pageGroup.parentElement).toHaveTextContent(/^Page2/);
            expect(within(pageGroup).getAllByRole("option")).toHaveLength(2);
            expect(within(pageGroup).getAllByText("able")).toHaveLength(2);
            expect(dialog.querySelectorAll("mark").length).toBeGreaterThan(0);
        });

        await step("Selecting a tab shows only that type but keeps the counts", async () => {
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");

            await userEvent.click(within(dialog).getByRole("tab", { name: /^Link/ }));

            await waitFor(() => {
                expect(within(dialog).getAllByRole("group")).toHaveLength(1);
            });
            expect(within(dialog).getByText("Absolute")).toBeInTheDocument();
            expect(within(dialog).getByRole("tab", { name: /^Link/ })).toHaveAttribute("aria-selected", "true");
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All5");
            expect(within(dialog).getByRole("tab", { name: /^Page/ })).toHaveTextContent("Page2");
        });

        await step("A type without results has a tab with 0 results", async () => {
            const predefinedPageTab = within(dialog).getByRole("tab", { name: /^Predefined page/ });
            expect(predefinedPageTab).toHaveTextContent("Predefined page0");

            await userEvent.click(predefinedPageTab);

            expect(await within(dialog).findByText("Check the spelling or try a shorter search term.")).toBeInTheDocument();
            expect(predefinedPageTab).toHaveAttribute("aria-selected", "true");
        });
    },
};

/** Types switched off in the settings are neither searched nor shown as a tab. The settings list every type before the first search. */
export const ChooseWhatToSearch: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        await step("The settings list all types before the first search", async () => {
            await within(dialog).findByRole("tab", { name: /^Product/ });
            await userEvent.click(within(dialog).getByRole("button", { name: "Choose what to search" }));
            const settings = await screen.findByRole("dialog", { name: "Choose what to search" });
            const typeSwitches = within(settings).getAllByRole("switch");
            expect(typeSwitches).toHaveLength(5);
            for (const typeSwitch of typeSwitches) {
                expect(typeSwitch).toBeChecked();
            }
            expect(within(settings).getByRole("switch", { name: "Predefined page" })).toBeInTheDocument();
            await userEvent.keyboard("{Escape}");
        });

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
                expect(within(dialog).getAllByRole("group")).toHaveLength(3);
            });
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveTextContent("All4");
        });
    },
};

/** When none of the switched on types is offered anymore, e.g., after a permission was removed, all offered types are searched. */
export const OnlySwitchedOffTypesOffered: Story = {
    beforeEach: () => {
        window.localStorage.setItem(
            `dextinity.fullTextSearch.disabledTypes.${currentUser.id}`,
            JSON.stringify(["Link", "News", "Page", "PredefinedPage", "Product"]),
        );
    },
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });

        await within(dialog).findByRole("tab", { name: /^Product/ });
        expect(within(dialog).getAllByRole("tab")).toHaveLength(6);
        await userEvent.click(within(dialog).getByRole("button", { name: "Choose what to search" }));
        const settings = await screen.findByRole("dialog", { name: "Choose what to search" });
        for (const typeSwitch of within(settings).getAllByRole("switch")) {
            expect(typeSwitch).toBeChecked();
        }
    },
};

/** Ctrl+K opens the dialog with the focus in the search input and closes it again. Escape clears the search first and closes the dialog when there's nothing left to clear. */
export const KeyboardShortcuts: Story = {
    play: async ({ userEvent, step }) => {
        await step("Ctrl+K opens the dialog", async () => {
            await userEvent.keyboard("{Control>}k{/Control}");
            expect(await screen.findByRole("dialog", { name: "Search" })).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.getByRole("combobox", { name: "Search" })).toHaveFocus();
            });
        });

        await step("Escape clears the search", async () => {
            const searchInput = screen.getByRole("combobox", { name: "Search" });
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
 * Enter opens it, and Tab switches the type tab.
 */
export const KeyboardNavigation: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const currentPath = canvas.getByTestId("current-path");
        const initialPath = currentPath.textContent ?? "";

        await userEvent.keyboard("{Control>}k{/Control}");
        const dialog = await screen.findByRole("dialog", { name: "Search" });
        const searchInput = within(dialog).getByRole("combobox", { name: "Search" });
        await waitFor(() => {
            expect(searchInput).toHaveFocus();
        });

        const expectActiveOption = (option: HTMLElement) => {
            expect(searchInput).toHaveAttribute("aria-activedescendant", option.id);
            expect(option).toHaveAttribute("aria-selected", "true");
            expect(
                within(dialog)
                    .getAllByRole("option")
                    .filter((otherOption) => otherOption.getAttribute("aria-selected") === "true"),
            ).toEqual([option]);
            expect(searchInput).toHaveFocus();
        };

        await step("The input controls the results listbox", async () => {
            await userEvent.keyboard("ab");

            const listbox = await within(dialog).findByRole("listbox", { name: "Search results" }, { timeout: 3000 });
            expect(searchInput).toHaveAttribute("aria-expanded", "true");
            expect(searchInput).toHaveAttribute("aria-controls", listbox.id);
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
            expect(within(listbox).getAllByRole("group")).toHaveLength(4);
            expect(within(listbox).getByRole("group", { name: "Page" })).toBeInTheDocument();
            await waitFor(() => {
                expect(within(dialog).getByRole("status")).toHaveTextContent("5 results");
            });
        });

        await step("ArrowDown and ArrowUp move the active result across the groups and wrap around", async () => {
            const options = within(dialog).getAllByRole("option");
            expect(options).toHaveLength(5);
            expect(new Set(options.map((option) => option.id)).size).toBe(options.length);

            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(options[0]);

            await userEvent.keyboard("{ArrowDown}{ArrowDown}");
            expectActiveOption(options[2]);
            expect(within(dialog).getByRole("group", { name: "Page" })).toContainElement(options[2]);

            await userEvent.keyboard("{ArrowDown}{ArrowDown}");
            expectActiveOption(options[4]);

            await userEvent.keyboard("{ArrowDown}");
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
            expectActiveOption(productOption);
        });

        await step("Hovering a result makes it the active one", async () => {
            const options = within(dialog).getAllByRole("option");
            await userEvent.hover(options[1]);
            expectActiveOption(options[1]);
        });

        await step("Tab and Shift+Tab switch the type tab and keep the focus in the input", async () => {
            await userEvent.tab();

            await waitFor(() => {
                expect(within(dialog).getByRole("tab", { name: /^Link/ })).toHaveAttribute("aria-selected", "true");
            });
            await waitFor(() => {
                expect(within(dialog).getAllByRole("option")).toHaveLength(1);
            });
            expect(searchInput).toHaveFocus();
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");

            await userEvent.tab();
            await waitFor(() => {
                expect(within(dialog).getByRole("tab", { name: /^Page/ })).toHaveAttribute("aria-selected", "true");
            });
            expect(searchInput).toHaveFocus();

            await userEvent.tab({ shift: true });
            await userEvent.tab({ shift: true });
            await waitFor(() => {
                expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");
            });
            await waitFor(() => {
                expect(within(dialog).getAllByRole("option")).toHaveLength(5);
            });
            expect(searchInput).toHaveFocus();
        });

        await step("Tab also selects a type without results, where the arrow keys do nothing", async () => {
            await userEvent.tab();
            await userEvent.tab();
            await userEvent.tab();
            await waitFor(() => {
                expect(within(dialog).getByRole("tab", { name: /^Predefined page/ })).toHaveAttribute("aria-selected", "true");
            });
            expect(await within(dialog).findByText("Check the spelling or try a shorter search term.")).toBeInTheDocument();
            expect(searchInput).toHaveAttribute("aria-expanded", "false");
            expect(searchInput).not.toHaveAttribute("aria-controls");

            await userEvent.keyboard("{ArrowDown}{ArrowUp}");
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
            expect(searchInput).toHaveFocus();

            for (let index = 0; index < 3; index++) {
                await userEvent.tab({ shift: true });
            }
            await waitFor(() => {
                expect(within(dialog).getAllByRole("option")).toHaveLength(5);
            });
            expect(within(dialog).getByRole("tab", { name: /^All/ })).toHaveAttribute("aria-selected", "true");
        });

        await step("Enter opens the active result and closes the dialog", async () => {
            await userEvent.keyboard("{ArrowDown}{Enter}");

            await waitFor(() => {
                expect(currentPath).toHaveTextContent(/\/news\/1\/edit$/);
            });
            await waitFor(() => {
                expect(screen.queryByRole("dialog", { name: "Search" })).not.toBeInTheDocument();
            });
        });

        await step("An arrow key pressed before the results arrive activates the first result once they're loaded", async () => {
            await userEvent.keyboard("{Control>}k{/Control}");
            const reopenedDialog = await screen.findByRole("dialog", { name: "Search" });
            const reopenedSearchInput = within(reopenedDialog).getByRole("combobox", { name: "Search" });
            await waitFor(() => {
                expect(reopenedSearchInput).toHaveFocus();
            });

            await userEvent.keyboard("ab{ArrowDown}");
            expect(within(reopenedDialog).queryByRole("option")).not.toBeInTheDocument();

            await waitFor(
                () => {
                    expect(reopenedSearchInput).toHaveAttribute("aria-activedescendant", within(reopenedDialog).getAllByRole("option")[0].id);
                },
                { timeout: 3000 },
            );
        });

        await step("While a changed search loads, the arrow keys and Enter don't act on the results of the previous search", async () => {
            const reopenedDialog = screen.getByRole("dialog", { name: "Search" });
            const reopenedSearchInput = within(reopenedDialog).getByRole("combobox", { name: "Search" });
            expect(within(reopenedDialog).getAllByRole("option")).toHaveLength(5);

            await userEvent.keyboard("b{ArrowUp}");
            expect(within(reopenedDialog).getAllByRole("option")).toHaveLength(5);
            expect(reopenedSearchInput).not.toHaveAttribute("aria-activedescendant");

            await userEvent.keyboard("{Enter}");
            expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();

            await waitFor(
                () => {
                    expect(within(reopenedDialog).getAllByRole("option")).toHaveLength(1);
                },
                { timeout: 3000 },
            );
            expect(reopenedSearchInput).toHaveAttribute("aria-activedescendant", within(reopenedDialog).getByRole("option").id);
        });

        await step("Escape clears the search, then closes the dialog", async () => {
            const reopenedSearchInput = screen.getByRole("combobox", { name: "Search" });
            await userEvent.keyboard("{Escape}");

            expect(reopenedSearchInput).toHaveValue("");
            expect(reopenedSearchInput).toHaveAttribute("aria-expanded", "false");
            expect(reopenedSearchInput).not.toHaveAttribute("aria-activedescendant");

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
        expect(within(dialog).getByRole("tab", { name: /^News/ })).toHaveTextContent("News0");
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        const dialog = await openSearchDialog({ canvas, userEvent });
        await search({ dialog, userEvent, text: "error" });

        expect(await within(dialog).findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};
