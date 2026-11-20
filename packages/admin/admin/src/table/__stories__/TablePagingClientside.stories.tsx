import type { Meta, StoryObj } from "@storybook/react-vite";

import type { IPagingInfo } from "../paging/IPagingInfo";
import { Table } from "../Table";
import { useTableQueryPaging } from "../useTableQueryPaging";

interface IExampleRow {
    id: number;
    foo1: string;
    foo2: string;
}

const meta: Meta = {
    title: "components/table/TablePagingClientside",
};

export default meta;

type Story = StoryObj;

export const PagingClientside: Story = {
    render: () => {
        const data = Array.from(Array(100).keys()).map((i): IExampleRow => ({
            id: i,
            foo1: `blub1 ${i}`,
            foo2: `blub2 ${i}`,
        }));

        const pagingApi = useTableQueryPaging(1);

        const pageSize = 10;
        const totalPages = data.length / pageSize;
        const pagingInfo: IPagingInfo = {
            fetchNextPage:
                pagingApi.current < totalPages
                    ? () => {
                          return pagingApi.changePage(pagingApi.current + 1);
                      }
                    : undefined,
            fetchPreviousPage: pagingApi.current > 1 ? () => pagingApi.changePage(pagingApi.current - 1) : undefined,
            totalPages,
            attachTableRef: pagingApi.attachTableRef,
        };
        const pagedData = data.slice((pagingApi.current - 1) * pageSize, pagingApi.current * pageSize);
        return (
            <Table
                data={pagedData}
                pagingInfo={pagingInfo}
                totalCount={data.length}
                columns={[
                    {
                        name: "foo1",
                        header: "Foo1",
                        sortable: true,
                    },
                    {
                        name: "foo2",
                        header: "Foo2",
                        render: (row) => <strong>{row.id}</strong>,
                        sortable: true,
                    },
                    {
                        name: "bar",
                        visible: false,
                    },
                ]}
            />
        );
    },
};
