import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from "../Table";
import { SortDirection, useTableQuerySort } from "../useTableQuerySort";

interface IExampleRow {
    id: number;
    foo1: string;
    foo2: string;
}

const meta: Meta = {
    title: "components/table/TableSortClientside",
};

export default meta;

type Story = StoryObj;

export const SortClientside: Story = {
    render: () => {
        const data: IExampleRow[] = [
            { id: 1, foo1: "blub1", foo2: "blub2" },
            { id: 2, foo1: "blub2", foo2: "blub1" },
        ];

        const sortApi = useTableQuerySort({
            columnName: "foo1",
            direction: SortDirection.ASC,
        });

        const sortColumn = sortApi.current.columnName as keyof IExampleRow;

        const sortedData = data.sort((a, b) => (a[sortColumn] < b[sortColumn] ? -1 : 1));
        return (
            <Table
                sortApi={sortApi}
                data={sortedData}
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
