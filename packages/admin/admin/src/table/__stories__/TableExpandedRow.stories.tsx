import { AddNoCircle } from "@dextinity/admin-icons";
import { IconButton, TableCell } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { type ITableHeadRowProps, type ITableRowProps, Table, TableColumns, TableHeadColumns } from "../Table";
import { TableBodyRow } from "../TableBodyRow";

interface IRow {
    id: number;
    foo1: string;
    foo2: string;
}

function ExpandableTableRow({ rowProps, ...rest }: ITableRowProps<IRow>) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <>
            <TableBodyRow {...rowProps}>
                <TableColumns {...rest} />
                <TableCell>
                    <IconButton
                        onClick={() => {
                            setIsExpanded(!isExpanded);
                        }}
                        size="large"
                    >
                        <AddNoCircle />
                    </IconButton>
                </TableCell>
            </TableBodyRow>
            {isExpanded && (
                <TableBodyRow index={rowProps.index}>
                    <TableCell colSpan={999}>Deeetails</TableCell>
                </TableBodyRow>
            )}
        </>
    );
}

function ExampleHeadTableRow<TRow extends IRow>(props: ITableHeadRowProps<TRow>) {
    return (
        <TableRow>
            <TableHeadColumns {...props} />
            <TableCell />
        </TableRow>
    );
}

const meta: Meta = {
    title: "components/table/TableExpandedRow",
};

export default meta;

type Story = StoryObj;

export const ExpandedRow: Story = {
    render: () => {
        const data: IRow[] = [
            { id: 1, foo1: "blub", foo2: "blub" },
            { id: 2, foo1: "blub", foo2: "blub" },
        ];

        return (
            <Table
                data={data}
                totalCount={data.length}
                renderTableRow={(props) => <ExpandableTableRow {...props} />}
                renderHeadTableRow={(props) => <ExampleHeadTableRow {...props} />}
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
                        visible: false,
                    },
                ]}
            />
        );
    },
};
