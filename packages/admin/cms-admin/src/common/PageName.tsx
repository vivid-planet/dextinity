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

export function PageName({ pageId }: PageNameProps): JSX.Element {
    const { data: pageLoaded } = useQuery<GQLPageQuery, GQLPageQueryVariables>(pageQuery, {
        variables: { id: pageId },
        context: LocalErrorScopeApolloContext,
    });

    return (
        <FixedWidthList>
            <ListItem>
                <ListItemText primary={pageLoaded?.page?.name} secondary={pageLoaded?.page?.path} />
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
