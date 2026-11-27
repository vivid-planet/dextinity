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

async function search({ canvas, userEvent, text }: Pick<StoryContext, "canvas" | "userEvent"> & { text: string }) {
    await userEvent.type(await canvas.findByRole("textbox"), text);
}

/**
 * Search for "ab" to see the results grouped by type, each group with the number of results of its type.
 * The product result isn't registered in `entities`, so it can't be opened.
 */
export const Default: Story = {
    play: async ({ canvas, userEvent }) => {
        await search({ canvas, userEvent, text: "ab" });

        await waitFor(
            () => {
                expect(screen.getAllByRole("group")).toHaveLength(4);
            },
            { timeout: 3000 },
        );
        const groupsInExpectedOrder = ["News", "Link", "Page", "Product"].map((name) => screen.getByRole("group", { name }));
        expect(screen.getAllByRole("group")).toEqual(groupsInExpectedOrder);
        const pageGroup = screen.getByRole("group", { name: "Page" });
        expect(pageGroup.parentElement).toHaveTextContent(/^Page2/);
        expect(within(pageGroup).getAllByRole("button")).toHaveLength(2);
        expect(within(screen.getByRole("group", { name: "Product" })).getByRole("button")).toHaveAttribute("aria-disabled", "true");

        await userEvent.click(within(pageGroup).getByRole("button", { name: /Contact/ }));

        await waitFor(() => {
            expect(canvas.getByTestId("current-path")).toHaveTextContent("/pages/4/edit");
        });
    },
};

export const NoResults: Story = {
    play: async ({ canvas, userEvent }) => {
        await search({ canvas, userEvent, text: "nothing" });

        expect(await screen.findByText("No results found", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};

export const SearchFailed: Story = {
    play: async ({ canvas, userEvent }) => {
        await search({ canvas, userEvent, text: "error" });

        expect(await screen.findByText("The search failed. Please try again.", {}, { timeout: 3000 })).toBeInTheDocument();
    },
};
