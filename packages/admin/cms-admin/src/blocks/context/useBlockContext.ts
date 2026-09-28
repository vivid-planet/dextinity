import { useApolloClient } from "@apollo/client";
import { useContext } from "react";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { useDamBasePath } from "../../dam/config/damConfig";
import { usePageTreeScope } from "../../pages/config/usePageTreeScope";
import { type BlockContext, CustomBlockContext } from "./BlockContext";

export function useBlockContext(): BlockContext {
    const { apiUrl } = useDextinityConfig();
    const damBasePath = useDamBasePath();
    const apolloClient = useApolloClient();
    const customContext = useContext(CustomBlockContext);
    const pageTreeScope = usePageTreeScope();

    return { ...customContext, apiUrl, apolloClient, damBasePath, pageTreeScope };
}
