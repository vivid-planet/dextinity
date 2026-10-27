import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { DextinityConfigProvider } from "@dextinity/cms-admin";
import type { PropsWithChildren } from "react";

import { useApi } from "../../core/client/index.js";

// The block framework of `@dextinity/cms-admin` takes the Apollo client from the context, also for blocks that don't use GraphQL.
// The blocks of the serverless packages load their data via REST, so every GraphQL operation is a mistake and fails.
const restOnlyApolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
        (operation) =>
            new Observable((observer) =>
                observer.error(new Error(`GraphQL isn't available, but a block sent the operation ${operation.operationName}`)),
            ),
    ),
});

interface BlocksProviderProps {
    /** The aspect ratios of the DAM, e.g. `["16x9", "1x1"]`, which the text image block offers */
    allowedImageAspectRatios: string[];
}

/**
 * Provides what the block framework of `@dextinity/cms-admin` reads from its config and the Apollo context, so its factories
 * (`createBlocksBlock`, `createCompositeBlock`, `createRichTextBlock`, …) and the blocks of the serverless packages work in an admin
 * without GraphQL. `apiUrl` comes from `ApiProvider`, the blocks create their REST clients below it.
 */
export function BlocksProvider({ allowedImageAspectRatios, children }: PropsWithChildren<BlocksProviderProps>) {
    const { apiUrl } = useApi();

    return (
        <ApolloProvider client={restOnlyApolloClient}>
            <DextinityConfigProvider
                // Absolute, the blocks put URLs of the API into the state of the block preview, which runs on the site's origin
                apiUrl={new URL(apiUrl, window.location.origin).href.replace(/\/$/, "")}
                graphQLApiUrl=""
                adminUrl={window.location.origin}
                // Only allowedImageAspectRatios is read by the reused blocks, the uploads of the DAM are validated by the DAM's own admin
                dam={{ allowedImageAspectRatios, uploadsMaxFileSize: 0, maxSrcResolution: 0 }}
            >
                {children}
            </DextinityConfigProvider>
        </ApolloProvider>
    );
}
