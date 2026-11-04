import { graphql, HttpResponse } from "msw";

export const currentUserHandler = graphql.query("CurrentUser", () => {
    return HttpResponse.json({
        data: {
            currentUser: {
                __typename: "CurrentUser",
                id: "1",
                name: "Max Mustermann",
                email: "max@mustermann.com",
                impersonated: false,
                accountUrl: null,
                authenticatedUser: {
                    __typename: "AuthenticatedUser",
                    name: "Max Mustermann",
                    email: "max@mustermann.com",
                },
                permissions: [],
                allowedContentScopes: [],
            },
        },
    });
});
