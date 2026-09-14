import { gql, useQuery } from "@apollo/client";
import {
    Button,
    InlineAlert,
    Loading,
    Stack,
    StackLink,
    StackPage,
    StackPageTitle,
    StackSwitch,
    StackToolbar,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { ContentScopeIndicator } from "@dextinity/cms-admin";
import { Box } from "@mui/system";
import type { FunctionComponent } from "react";
import { useLocation } from "react-router";

import { apolloStoryDecorator } from "../../../apollo-story.decorator";
import { storyRouterDecorator } from "../../../story-router.decorator";

export default {
    title: "@dextinity/admin/stack/Recursive Stack",
    decorators: [apolloStoryDecorator("/graphql"), storyRouterDecorator()],
};

const subfolderQuery = gql`
    query Subfolder($id: ID) {
        subfolder(id: $id) {
            id
            name
        }
    }
`;

type GQLSubfolderQuery = {
    subfolder: Array<{
        id: string;
        name: string;
    }>;
};
type GQLSubfolderQueryVariables = {
    id?: string;
};

interface PageProps {
    id?: string;
}

const Page = ({ id }: PageProps) => {
    const { data, loading, error } = useQuery<GQLSubfolderQuery, GQLSubfolderQueryVariables>(subfolderQuery, {
        variables: {
            id,
        },
    });

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }
    if (error) {
        return <InlineAlert severity="error" />;
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="left" gap={2} padding={2}>
            <div>Current ID: {id}</div>
            {data?.subfolder.length === 0 && <InlineAlert title="No entries" severity="warning" description="There are no entries in this folder" />}
            {data?.subfolder.map((childId) => {
                return (
                    <Button variant="primary" component={StackLink} pageName="id" payload={childId.id}>
                        {childId.name}
                    </Button>
                );
            })}
        </Box>
    );
};

type RecursiveToolbarProps = {
    id?: string;
};

type GQLFolderQuery = {
    folder: {
        id: string;
        name: string;
    };
};
type GQLFolderQueryVariables = {
    id?: string;
};

const recursiveToolbarQuery = gql`
    query RecursiveToolbar($id: ID) {
        folder(id: $id) {
            id
            name
        }
    }
`;

const RecursiveToolbar: FunctionComponent<RecursiveToolbarProps> = ({ id }) => {
    const { data } = useQuery<GQLFolderQuery, GQLFolderQueryVariables>(recursiveToolbarQuery, {
        variables: {
            id,
        },
    });

    return (
        <StackPageTitle title={data?.folder.name ?? " "}>
            <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarBackButton />
                <ToolbarAutomaticTitleItem />
            </StackToolbar>
        </StackPageTitle>
    );
};

type RecursivePageProps = {
    id?: string;
};
const RecursivePage: FunctionComponent<RecursivePageProps> = ({ id }) => {
    return (
        <StackSwitch>
            <StackPage name="grid">
                <Page id={id} />
            </StackPage>
            <StackPage name="id">
                {(id) => {
                    return (
                        <>
                            <RecursiveToolbar id={id} />
                            <RecursivePage id={id} />
                        </>
                    );
                }}
            </StackPage>
        </StackSwitch>
    );
};

/**
 * This example shows how to use the Stack component recursively.
 * Each page will have another StackSwitch with the same page and is loading the data based on the id.
 *
 * This is useful for tree structures like folders
 *
 * Breadcrumbs will be added automatically for each level
 */
export const RecursiveStack = () => {
    const location = useLocation();

    return (
        <Box>
            <div>Current Path: {JSON.stringify(location.pathname)}</div>

            <Stack topLevelTitle="Recursive Stack">
                <StackPageTitle>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                </StackPageTitle>

                <RecursivePage />
            </Stack>
        </Box>
    );
};
