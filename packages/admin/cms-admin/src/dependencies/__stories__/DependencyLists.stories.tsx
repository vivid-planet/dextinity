import { gql, type TypedDocumentNode } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { Box, Typography } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

import { CometConfigProvider } from "../../config/CometConfigContext";
import { DependenciesList } from "../DependenciesList";
import { DependentsList } from "../DependentsList";

const config: Meta = {
    title: "dependencies/DependencyLists",
};

export default config;

const dependenciesConfig = {
    entityDependencyMap: {
        Page: {
            displayName: "Page",
            resolvePath: async () => "/pages/page",
        },
        Link: {
            displayName: "Link",
            resolvePath: async () => "/pages/link",
        },
        DamFile: {
            displayName: "Asset",
            resolvePath: async () => "/assets/file",
        },
    },
};

const dependentsQuery = gql`
    query DependentsListStory($offset: Int!, $limit: Int!) {
        item: pageTreeNode(id: "root") {
            id
            dependents(offset: $offset, limit: $limit) {
                nodes {
                    rootGraphqlObjectType
                    rootId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }
` as TypedDocumentNode<any, any>;

const dependenciesQuery = gql`
    query DependenciesListStory($offset: Int!, $limit: Int!) {
        item: page(id: "root") {
            id
            dependencies(offset: $offset, limit: $limit) {
                nodes {
                    targetGraphqlObjectType
                    targetId
                    rootColumnName
                    jsonPath
                    name
                    secondaryInformation
                    visible
                }
                totalCount
            }
        }
    }
` as TypedDocumentNode<any, any>;

const dependentNodes = [
    {
        rootGraphqlObjectType: "Page",
        rootId: "1",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Home",
        secondaryInformation: "/",
        visible: true,
    },
    {
        rootGraphqlObjectType: "Page",
        rootId: "2",
        rootColumnName: "content",
        jsonPath: "root",
        name: "About us",
        secondaryInformation: "/about",
        visible: true,
    },
    {
        rootGraphqlObjectType: "Page",
        rootId: "3",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Draft campaign",
        secondaryInformation: "/campaign",
        visible: false,
    },
    {
        rootGraphqlObjectType: "Link",
        rootId: "4",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Footer link",
        secondaryInformation: "Footer",
        visible: true,
    },
    {
        rootGraphqlObjectType: "Link",
        rootId: "5",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Archived promo",
        secondaryInformation: "Promo",
        visible: false,
    },
];

const dependencyNodes = [
    {
        targetGraphqlObjectType: "DamFile",
        targetId: "10",
        rootColumnName: "content",
        jsonPath: "root",
        name: "hero.jpg",
        secondaryInformation: "Images",
        visible: true,
    },
    {
        targetGraphqlObjectType: "Page",
        targetId: "11",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Contact",
        secondaryInformation: "/contact",
        visible: true,
    },
    {
        targetGraphqlObjectType: "Page",
        targetId: "12",
        rootColumnName: "content",
        jsonPath: "root",
        name: "Unpublished landing page",
        secondaryInformation: "/landing",
        visible: false,
    },
    {
        targetGraphqlObjectType: "DamFile",
        targetId: "13",
        rootColumnName: "content",
        jsonPath: "root",
        name: "old-brochure.pdf",
        secondaryInformation: "Documents",
        visible: false,
    },
];

const dependentsMock = {
    request: { query: dependentsQuery },
    variableMatcher: () => true,
    result: { data: { item: { id: "root", dependents: { nodes: dependentNodes, totalCount: dependentNodes.length } } } },
};

const dependenciesMock = {
    request: { query: dependenciesQuery },
    variableMatcher: () => true,
    result: { data: { item: { id: "root", dependencies: { nodes: dependencyNodes, totalCount: dependencyNodes.length } } } },
};

export const Dependents = {
    render: () => (
        <CometConfigProvider graphQLApiUrl="/graphql" apiUrl="" adminUrl="" dependencies={dependenciesConfig}>
            <MockedProvider mocks={[dependentsMock, dependentsMock, dependentsMock]} addTypename={false}>
                <Box maxWidth={900}>
                    <Typography variant="h4" gutterBottom>
                        Dependents
                    </Typography>
                    <DependentsList query={dependentsQuery} variables={{}} />
                </Box>
            </MockedProvider>
        </CometConfigProvider>
    ),
};

export const Dependencies = {
    render: () => (
        <CometConfigProvider graphQLApiUrl="/graphql" apiUrl="" adminUrl="" dependencies={dependenciesConfig}>
            <MockedProvider mocks={[dependenciesMock, dependenciesMock, dependenciesMock]} addTypename={false}>
                <Box maxWidth={900}>
                    <Typography variant="h4" gutterBottom>
                        Dependencies
                    </Typography>
                    <DependenciesList query={dependenciesQuery} variables={{}} />
                </Box>
            </MockedProvider>
        </CometConfigProvider>
    ),
};
