import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client";
import type { Decorator } from "@storybook/react-vite";

// Stories run without the demo API, so queries that blocks send (e.g. when opening a link dialog) fail.
const apolloClient = new ApolloClient({
    link: createHttpLink({ uri: "/graphql" }),
    cache: new InMemoryCache(),
});

export const ApolloDecorator: Decorator = (Story) => (
    <ApolloProvider client={apolloClient}>
        <Story />
    </ApolloProvider>
);
