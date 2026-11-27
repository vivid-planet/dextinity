import { CurrentUserContext, type CurrentUserInterface } from "@dextinity/cms-admin";
import type { Decorator } from "@storybook/react-vite";

const currentUser: CurrentUserInterface = {
    id: "storybook-user",
    name: "Storybook User",
    email: "storybook@example.com",
    impersonated: false,
    authenticatedUser: null,
    permissions: [],
    allowedContentScopes: [{ scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "English" } }],
};

// The real CurrentUserProvider loads the user from the API, which stories run without.
export const CurrentUserProviderDecorator: Decorator = (Story) => (
    <CurrentUserContext.Provider value={{ currentUser, isAllowed: () => true }}>
        <Story />
    </CurrentUserContext.Provider>
);
