import { gql } from "@apollo/client";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import type { LaunchesPastResult } from "../../../.storybook/mocks/handlers";
import { ErrorDialogHandler } from "../../error/errordialog/ErrorDialogHandler";
import { Table } from "../Table";
import { TableQuery } from "../TableQuery";
import { useTableQuery } from "../useTableQuery";

interface QueryData {
    launchesPastResult: LaunchesPastResult;
}

const ErrorDialogHandlerDecorator: Decorator = (Story) => (
    <>
        <ErrorDialogHandler />
        <Story />
    </>
);

type Args = {
    query: string;
};

const meta: Meta<Args> = {
    title: "components/table/GlobalErrorHandling",
    decorators: [ErrorDialogHandlerDecorator],
    args: {
        query: "query LaunchesPast { launchesPastResult { data { id mission_name launch_date_local } result { totalCount } } }",
    },
    argTypes: {
        query: {
            name: "GQL Query",
        },
    },
};

export default meta;

type Story = StoryObj<Args>;

/**
 * Change the query, for example the operation name, to make the request fail and open the global error dialog.
 */
export const GlobalErrorHandling: Story = {
    render: ({ query }) => {
        const { tableData, api, loading, error } = useTableQuery<QueryData, Record<string, any>>()(
            gql`
                ${query}
            `,
            {
                resolveTableData: (data) => ({
                    data: data.launchesPastResult.data,
                    totalCount: data.launchesPastResult.result.totalCount,
                }),
                globalErrorHandling: true,
            },
        );

        return (
            <TableQuery api={api} loading={loading} error={error}>
                {tableData && (
                    <Table
                        {...tableData}
                        columns={[
                            {
                                name: "id",
                                header: "Id",
                            },
                            {
                                name: "mission_name",
                                header: "Mission Name",
                            },
                            {
                                name: "launch_date_local",
                                header: "Launch Date",
                            },
                        ]}
                    />
                )}
            </TableQuery>
        );
    },
};
