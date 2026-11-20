import { TableCell } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useWindowSize } from "../../helpers/useWindowSize";
import { type ITableRowProps, Table, TableColumns } from "../Table";
import { TableBodyRow } from "../TableBodyRow";

function ExampleTableRow({ columns, row, showSecondRow, rowProps }: ITableRowProps<IExampleRow> & { showSecondRow: boolean }) {
    return (
        <>
            <TableBodyRow {...rowProps}>
                <TableColumns columns={columns} row={row} />
            </TableBodyRow>
            {showSecondRow && (
                <TableBodyRow index={rowProps.index} hideTableHead={rowProps.hideTableHead}>
                    <TableCell colSpan={3}>Bar: {row.bar}</TableCell>
                </TableBodyRow>
            )}
        </>
    );
}

interface IExampleRow {
    id: number;
    foo1: string;
    foo2: string;
    bar: string;
}

const meta: Meta = {
    title: "components/table/TableResponsive",
};

export default meta;

type Story = StoryObj;

export const Responsive: Story = {
    render: () => {
        const { width } = useWindowSize();
        const showSecondRow = width < 1024;

        const data: IExampleRow[] = [
            { id: 1, foo1: "blub", foo2: "blub", bar: "barr" },
            { id: 2, foo1: "blub", foo2: "blub", bar: "barr" },
        ];
        return (
            <Table
                data={data}
                totalCount={data.length}
                renderTableRow={(props) => <ExampleTableRow {...props} showSecondRow={showSecondRow} />}
                columns={[
                    {
                        name: "foo1",
                        header: "Foo1",
                    },
                    {
                        name: "foo2",
                        header: "Foo2",
                        render: (row) => <strong>{row.id}</strong>,
                    },
                    {
                        name: "bar",
                        header: "Bar",
                        visible: !showSecondRow,
                    },
                ]}
            />
        );
    },
};
