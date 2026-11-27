import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import type { Decorator } from "@storybook/react-vite";

// Stories run without the demo API, so queries that blocks send (e.g. when opening a link dialog) fail.
const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: "/graphql" }),
    cache: new InMemoryCache(),
});

export const ApolloDecorator: Decorator = (Story) => (
    <ApolloProvider client={apolloClient}>
        <Story />
    </ApolloProvider>
);
