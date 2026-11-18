import { gql } from "@apollo/client";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { MainContent } from "../../common/MainContent";
import { createOffsetLimitPagingAction } from "../paging/createOffsetLimitPagingAction";
import { Table } from "../Table";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";
import { useTableQueryPaging } from "../useTableQueryPaging";

const meta: Meta = {
    title: "components/table/TableOffsetLimitPaging",
};

export default meta;

type Story = StoryObj;

export const PagingOffsetLimit: Story = {
    render: () => {
        const pagingApi = useTableQueryPaging(0);
        const limit = 10;
        const { tableData, api, loading, error } = useTableQuery<
            { launchesPastResult: LaunchesPastResult },
            { limit?: number; offset?: number; sort?: string; order?: string }
        >()(
            gql`
                query LaunchesPast($limit: Int, $offset: Int, $sort: String, $order: String) {
                    launchesPastResult(limit: $limit, offset: $offset, sort: $sort, order: $order) {
                        data {
                            id
                            mission_name
                            launch_date_local
                        }
                        result {
                            totalCount
                        }
                    }
                }
            `,
            {
                variables: {
                    offset: pagingApi.current,
                    limit,
                },
                resolveTableData: (data) => {
                    return {
                        data: data?.launchesPastResult?.data,
                        totalCount: data?.launchesPastResult?.result.totalCount,
                        pagingInfo: createOffsetLimitPagingAction(pagingApi, { totalCount: data?.launchesPastResult?.result.totalCount }, limit),
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
