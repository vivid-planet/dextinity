import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client";
import type { Decorator } from "@storybook/react-vite";

import { createErrorDialogApolloLink } from "../../src/error/errordialog/createErrorDialogApolloLink";

const apolloClient = new ApolloClient({
    link: ApolloLink.from([createErrorDialogApolloLink(), createHttpLink({ uri: "/graphql" })]),
    cache: new InMemoryCache(),
    defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
});

export const ApolloDecorator: Decorator = (Story) => (
    <ApolloProvider client={apolloClient}>
        <Story />
    </ApolloProvider>
);
