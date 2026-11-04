import type { ApolloClient } from "@apollo/client";
import { createContext } from "react";

import type { ContentScope } from "../../contentScope/Provider";

export interface BlockContext {
    apiUrl: string;
    apolloClient: ApolloClient<object>;
    damBasePath: string;
    pageTreeScope: ContentScope;
}

export const CustomBlockContext = createContext<Omit<BlockContext, "apiUrl" | "apolloClient" | "damBasePath" | "pageTreeScope"> | undefined>(
    undefined,
);
