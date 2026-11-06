import { gql, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { List, ListItem, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { JSX } from "react";

import type { GQLPageQuery, GQLPageQueryVariables } from "./PageName.generated";

const pageFragment = gql`
    fragment Page on PageTreeNode {
        id
        name
        path
    }
`;

interface PageNameProps {
    pageId: string;
}

/** The name and path of a page in the page tree, e.g. for the header of an editor. `undefined` while loading. */
export function usePageName(pageId: string, { skip = false }: { skip?: boolean } = {}): { name: string; path: string } | undefined {
    const { data } = useQuery<GQLPageQuery, GQLPageQueryVariables>(pageQuery, {
        variables: { id: pageId },
        context: LocalErrorScopeApolloContext,
        skip,
    });
    return data?.page ?? undefined;
}

export function PageName({ pageId }: PageNameProps): JSX.Element {
    const page = usePageName(pageId);

    return (
        <FixedWidthList>
            <ListItem>
                <ListItemText primary={page?.name} secondary={page?.path} />
            </ListItem>
        </FixedWidthList>
    );
}

const pageQuery = gql`
    query Page($id: ID!) {
        page: pageTreeNode(id: $id) {
            ...Page
        }
    }

    ${pageFragment}
`;

const FixedWidthList = styled(List)`
    display: flex;
    justify-content: center;
`;
