import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import type { GQLFullTextSearchTypesQuery, GQLFullTextSearchTypesQueryVariables } from "./useFullTextSearchTypes.generated";

export type FullTextSearchType = GQLFullTextSearchTypesQuery["myFullTextSearchTypes"][number];

const fullTextSearchTypesQuery = gql`
    query FullTextSearchTypes {
        myFullTextSearchTypes {
            type
            entityName
        }
    }
`;

export function useFullTextSearchTypes({ skip = false }: { skip?: boolean } = {}) {
    const { data, error } = useQuery<GQLFullTextSearchTypesQuery, GQLFullTextSearchTypesQueryVariables>(fullTextSearchTypesQuery, { skip });

    return { types: data?.myFullTextSearchTypes, error };
}
