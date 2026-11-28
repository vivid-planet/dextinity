import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { useDextinityConfig } from "../config/DextinityConfigContext";
import type { GQLFullTextSearchTypesQuery, GQLFullTextSearchTypesQueryVariables } from "./useFullTextSearchTypes.generated";
import type { FullTextSearchType } from "./useFullTextSearchTypeSettings";

const fullTextSearchTypesQuery = gql`
    query FullTextSearchTypes {
        fullTextSearchTypes {
            type
            entityName
        }
    }
`;

/**
 * Returns all types the current user may search, the page tree document types first, in the order of the page tree config.
 */
export function useFullTextSearchTypes({ skip = false }: { skip?: boolean } = {}) {
    const { pageTree } = useDextinityConfig();
    const { data, error } = useQuery<GQLFullTextSearchTypesQuery, GQLFullTextSearchTypesQueryVariables>(fullTextSearchTypesQuery, { skip });

    const types = useMemo(() => {
        if (!data) {
            return undefined;
        }

        const documentTypeOrder = Object.keys(pageTree?.documentTypes ?? {});
        const getSortIndex = ({ type, entityName }: FullTextSearchType) => {
            if (entityName !== "PageTreeNode") {
                return documentTypeOrder.length + 1;
            }
            const documentTypeIndex = documentTypeOrder.indexOf(type);
            return documentTypeIndex === -1 ? documentTypeOrder.length : documentTypeIndex;
        };

        return [...data.fullTextSearchTypes].sort((a, b) => getSortIndex(a) - getSortIndex(b));
    }, [data, pageTree]);

    return { types, error };
}
