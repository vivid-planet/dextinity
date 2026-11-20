import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
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
    render: () => (
        <Header>
            <SearchHeaderItem />
        </Header>
    ),
};

export default config;

type Story = StoryObj<typeof config>;

/**
 * Search for "ab" to see title hits before content hits, highlighted snippets, and the type chips.
 * The product result has no `entityDependencyMap` entry, so it can't be opened.
 */
export const Default: Story = {
    play: async ({ canvas, userEvent, step }) => {
        await step("Results show highlights and type labels", async () => {
            await userEvent.type(await canvas.findByRole("combobox", { name: "Search" }), "ab");

            const resultsList = await screen.findByRole("listbox", { name: "Search results" }, { timeout: 3000 });
            expect(within(resultsList).getAllByRole("option")).toHaveLength(4);
            expect(resultsList.querySelectorAll("mark").length).toBeGreaterThan(0);
            expect(within(resultsList).getByText("Link")).toBeInTheDocument();
            expect(within(resultsList).getByText("Product")).toBeInTheDocument();
            expect(within(resultsList).getByText("able")).toBeInTheDocument();
            expect(screen.getByText("Showing 4 of 4")).toBeInTheDocument();
        });

        await step("Selecting a type chip filters the results but keeps the counts", async () => {
            await userEvent.click(screen.getByRole("button", { name: "Link (1)" }));

            await waitFor(() => {
                expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(1);
            });
            expect(screen.getByText("Absolute")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Link (1)" })).toHaveAttribute("aria-pressed", "true");
            expect(screen.getByRole("button", { name: "All (4)" })).toHaveAttribute("aria-pressed", "false");
            expect(screen.getByRole("button", { name: "News (1)" })).toBeInTheDocument();
        });
    },
};

/** A selected type without results stays visible with a count of 0, so it can be deselected. */
export const NoResultsInSelectedTypes: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const searchInput = await canvas.findByRole("combobox", { name: "Search" });

        await step("Select a type", async () => {
            await userEvent.type(searchInput, "ab");
            await userEvent.click(await screen.findByRole("button", { name: "Link (1)" }, { timeout: 3000 }));
        });

        await step("Refine the search so that the selected type has no results", async () => {
            await userEvent.type(searchInput, "b");

            expect(await screen.findByText("No results in the selected types", {}, { timeout: 3000 })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Link (0)" })).toBeInTheDocument();
        });

        await step("Show all clears the selection", async () => {
            await userEvent.click(screen.getByRole("button", { name: "Show all" }));

            const resultsList = await screen.findByRole("listbox", {}, { timeout: 3000 });
            expect(within(resultsList).getAllByRole("option")).toHaveLength(1);
            expect(screen.getByRole("button", { name: "All (1)" })).toHaveAttribute("aria-pressed", "true");
        });
    },
};

export const NoResults: Story = {
    play: async ({ canvas, userEvent }) => {
        await userEvent.type(await canvas.findByRole("combobox", { name: "Search" }), "nothing");

        expect(await screen.findByText("No results found", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        await userEvent.type(await canvas.findByRole("combobox", { name: "Search" }), "error");

        expect(await screen.findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};

/**
 * Arrow keys move the active result, Enter opens it, and Escape closes the results.
 * Focus stays in the search input, the type chips are reachable with Tab.
 */
export const KeyboardNavigation: Story = {
    play: async ({ canvas, userEvent, step }) => {
        const searchInput = await canvas.findByRole("combobox", { name: "Search" });
        const currentPath = canvas.getByTestId("current-path");
        const initialPath = currentPath.textContent;

        const expectActiveOption = (option: HTMLElement) => {
            expect(searchInput).toHaveAttribute("aria-activedescendant", option.id);
            expect(option).toHaveAttribute("aria-selected", "true");
            expect(screen.getAllByRole("option").filter((otherOption) => otherOption.getAttribute("aria-selected") === "true")).toEqual([option]);
            expect(searchInput).toHaveFocus();
        };

        await step("The input controls the results listbox", async () => {
            await userEvent.type(searchInput, "ab");

            const resultsList = await screen.findByRole("listbox", { name: "Search results" }, { timeout: 3000 });
            expect(searchInput).toHaveAttribute("aria-expanded", "true");
            expect(searchInput).toHaveAttribute("aria-controls", resultsList.id);
            expect(searchInput).toHaveAttribute("aria-autocomplete", "list");
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
            expect(await screen.findByRole("status")).toHaveTextContent("4 results");
        });

        await step("ArrowDown and ArrowUp move the active result and wrap around", async () => {
            const options = screen.getAllByRole("option");
            expect(new Set(options.map((option) => option.id)).size).toBe(options.length);

            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(options[0]);

            await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
            expectActiveOption(options[3]);

            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(options[0]);

            await userEvent.keyboard("{ArrowUp}");
            expectActiveOption(options[3]);
        });

        await step("Enter on a result that can't be opened does nothing", async () => {
            const productOption = screen.getAllByRole("option")[3];
            expect(productOption).toHaveAttribute("aria-disabled", "true");
            expect(await screen.findByRole("tooltip", { name: "This result can't be opened" })).toBeInTheDocument();

            await userEvent.keyboard("{Enter}");

            expect(screen.getByRole("listbox")).toBeInTheDocument();
            expect(currentPath).toHaveTextContent(initialPath ?? "");
            expectActiveOption(productOption);
        });

        await step("Hovering a result makes it the active one", async () => {
            const options = screen.getAllByRole("option");
            await userEvent.hover(options[1]);
            expectActiveOption(options[1]);
        });

        await step("Escape closes the results and keeps the focus in the input", async () => {
            await userEvent.keyboard("{Escape}");

            await waitFor(() => {
                expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
            });
            expect(searchInput).toHaveAttribute("aria-expanded", "false");
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
            expect(searchInput).toHaveFocus();
        });

        await step("Tab moves from the input to the type chips, not to the results", async () => {
            await userEvent.keyboard("{ArrowDown}");
            expectActiveOption(screen.getAllByRole("option")[0]);

            await userEvent.tab();
            expect(screen.getByRole("button", { name: "All (4)" })).toHaveFocus();
            await userEvent.tab();
            expect(screen.getByRole("button", { name: "News (1)" })).toHaveFocus();

            await userEvent.keyboard("{Enter}");
            await waitFor(() => {
                expect(screen.getAllByRole("option")).toHaveLength(1);
            });
            expect(screen.getByRole("listbox")).toBeInTheDocument();
            expect(searchInput).toHaveAttribute("role", "combobox");
            expect(searchInput).not.toHaveAttribute("aria-activedescendant");
        });

        await step("Escape on a type chip closes the results and moves the focus to the input", async () => {
            expect(screen.getByRole("button", { name: "News (1)" })).toHaveFocus();
            await userEvent.keyboard("{Escape}");

            await waitFor(() => {
                expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
            });
            expect(searchInput).toHaveAttribute("aria-expanded", "false");
            expect(searchInput).toHaveFocus();
        });

        await step("Enter opens the active result", async () => {
            await userEvent.click(searchInput);
            await userEvent.keyboard("{ArrowDown}{Enter}");

            await waitFor(() => {
                expect(currentPath).toHaveTextContent(/\/news\/1\/edit$/);
            });
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
            expect(searchInput).toHaveFocus();
        });

        await step("Clicking the focused input shows the results again", async () => {
            await userEvent.click(searchInput);

            expect(await screen.findByRole("listbox")).toBeInTheDocument();
        });
    },
};
