import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MainContent } from "../../common/MainContent";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Table } from "../Table";
import { TableFilterFinalForm } from "../TableFilterFinalForm";
import { useTableQueryFilter } from "../useTableQueryFilter";

interface IExampleRow {
    id: number;
    foo1: string;
    foo2: string;
}
interface IFilterValues {
    query?: string;
}

const meta: Meta = {
    title: "components/table/TableFilterClientside",
};

export default meta;

type Story = StoryObj;

export const FilterClientside: Story = {
    render: () => {
        const data: IExampleRow[] = [
            { id: 1, foo1: "blub1", foo2: "blub2" },
            { id: 2, foo1: "blub2", foo2: "blub1" },
        ];

        const filterApi = useTableQueryFilter<IFilterValues>({});

        const filteredData = data.filter((i) => filterApi.current.query === undefined || i.foo1.includes(filterApi.current.query));
        return (
            <>
                <Toolbar>
                    <ToolbarItem>
                        <Typography variant="h3">Filter Clientside</Typography>
                    </ToolbarItem>
                    <ToolbarItem>
                        <TableFilterFinalForm filterApi={filterApi}>
                            <Field name="query" type="text" component={FinalFormInput} fullWidth />
                        </TableFilterFinalForm>
                    </ToolbarItem>
                </Toolbar>
                <MainContent>
                    <Table
                        data={filteredData}
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
                </MainContent>
            </>
        );
    },
};
