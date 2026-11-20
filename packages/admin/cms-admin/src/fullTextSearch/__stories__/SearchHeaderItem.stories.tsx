import { MainContent, MasterLayout } from "@dextinity/admin";
import { Typography } from "@mui/material";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
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
            await userEvent.type(await canvas.findByRole("textbox", { name: "Search" }), "ab");

            const resultsList = await screen.findByRole("list", {}, { timeout: 3000 });
            expect(within(resultsList).getAllByRole("button")).toHaveLength(4);
            expect(resultsList.querySelectorAll("mark").length).toBeGreaterThan(0);
            expect(within(resultsList).getByText("Link")).toBeInTheDocument();
            expect(within(resultsList).getByText("Product")).toBeInTheDocument();
            expect(within(resultsList).getByText("able")).toBeInTheDocument();
            expect(screen.getByText("Showing 4 of 4")).toBeInTheDocument();
        });

        await step("Selecting a type chip filters the results but keeps the counts", async () => {
            await userEvent.click(screen.getByRole("button", { name: "Link (1)" }));

            await waitFor(() => {
                expect(within(screen.getByRole("list")).getAllByRole("button")).toHaveLength(1);
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
        const searchInput = await canvas.findByRole("textbox", { name: "Search" });

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

            const resultsList = await screen.findByRole("list", {}, { timeout: 3000 });
            expect(within(resultsList).getAllByRole("button")).toHaveLength(1);
            expect(screen.getByRole("button", { name: "All (1)" })).toHaveAttribute("aria-pressed", "true");
        });
    },
};

export const NoResults: Story = {
    play: async ({ canvas, userEvent }) => {
        await userEvent.type(await canvas.findByRole("textbox", { name: "Search" }), "nothing");

        expect(await screen.findByText("No results found", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        await userEvent.type(await canvas.findByRole("textbox", { name: "Search" }), "error");

        expect(await screen.findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};
