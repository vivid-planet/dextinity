import { gql } from "@apollo/client";
import { MainContent, StackLink, Table, TableQuery, Toolbar, ToolbarAutomaticTitleItem, useTableQuery } from "@dextinity/admin";
import { Edit } from "@dextinity/admin-icons";
import { ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";

import type { GQLMainMenuQuery, GQLMainMenuQueryVariables } from "./MainMenuItems.generated";

const mainMenuQuery = gql`
    query MainMenu($contentScope: PageTreeNodeScopeInput!) {
        mainMenu(scope: $contentScope) {
            items {
                node {
                    id
                    name
                    path
                }
                content
            }
        }
    }
`;

const MainMenuItems = () => {
    const { scope } = useContentScope();

    const { tableData, api, loading, error } = useTableQuery<GQLMainMenuQuery, GQLMainMenuQueryVariables>()(mainMenuQuery, {
        variables: {
            contentScope: scope,
        },
        resolveTableData: ({ mainMenu }) => ({
            data: mainMenu.items.map((item) => ({ ...item, id: item.node.id })),
            totalCount: mainMenu.items.length,
        }),
    });

    return (
        <>
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarAutomaticTitleItem />
            </Toolbar>

            <MainContent>
                <TableQuery api={api} loading={loading} error={error}>
                    {tableData?.data && (
                        <Table
                            {...tableData}
                            columns={[
                                {
                                    name: "node.name",
                                    header: <FormattedMessage id="mainMenuItems.name" defaultMessage="Name" />,
                                },
                                {
                                    name: "node.path",
                                    header: <FormattedMessage id="mainMenuItems.path" defaultMessage="Path" />,
                                },
                                {
                                    name: "edit",
                                    header: "",
                                    cellProps: { align: "right" },
                                    render: (item) => (
                                        <IconButton component={StackLink} color="primary" pageName="edit" payload={item.node.id}>
                                            <Edit />
                                        </IconButton>
                                    ),
                                },
                            ]}
                        />
                    )}
                </TableQuery>
            </MainContent>
        </>
    );
};

export default MainMenuItems;
