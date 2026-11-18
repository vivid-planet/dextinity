import { gql } from "@apollo/client";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { LaunchesPastPagePagingResult } from "../../../.storybook/mocks/handlers";
import { MainContent } from "../../common/MainContent";
import { createPagePagingActions } from "../paging/createPagePagingActions";
import { Table } from "../Table";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryPaging } from "../useTableQueryPaging";

const meta: Meta = {
    title: "components/table/TablePaging",
};

export default meta;

type Story = StoryObj;

export const Paging: Story = {
    render: () => {
        const pagingApi = useTableQueryPaging(1);
        const { tableData, api, loading, error } = useTableQuery<
            { launchesPastPagePaging: LaunchesPastPagePagingResult },
            { page?: number; size?: number }
        >()(
            gql`
                query LaunchesPastPagePaging($page: Int, $size: Int) {
                    launchesPastPagePaging(page: $page, size: $size) {
                        nodes {
                            id
                            mission_name
                            launch_date_local
                        }
                        totalCount
                        nextPage
                        previousPage
                        totalPages
                    }
                }
            `,
            {
                variables: {
                    page: pagingApi.current,
                },
                resolveTableData: (data) => {
                    console.log("data ", data);

                    return {
                        data: data.launchesPastPagePaging.nodes,
                        totalCount: data.launchesPastPagePaging.totalCount,
                        pagingInfo: createPagePagingActions(pagingApi, {
                            totalPages: data.launchesPastPagePaging.totalPages,
                            nextPage: data.launchesPastPagePaging.nextPage ?? null,
                            previousPage: data.launchesPastPagePaging.previousPage ?? null,
                        }),
                    };
                },
                notifyOnNetworkStatusChange: true,
            },
        );

        return (
            <TableQuery api={api} loading={loading} error={error}>
                <MainContent>
                    {tableData && (
                        <Table
                            {...tableData}
                            columns={[
                                {
                                    name: "mission_name",
                                    header: "Mission Name",
                                },
                            ]}
                        />
                    )}
                </MainContent>
            </TableQuery>
        );
    },
};
