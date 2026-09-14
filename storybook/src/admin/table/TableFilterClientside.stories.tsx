import { Field, FinalFormInput, MainContent, Table, TableFilterFinalForm, Toolbar, ToolbarItem, useTableQueryFilter } from "@dextinity/admin";
import { Typography } from "@mui/material";

interface IExampleRow {
    id: number;
    foo1: string;
    foo2: string;
}
interface IFilterValues {
    query?: string;
}

export default {
    title: "@dextinity/admin/table",
};

export const FilterClientside = () => {
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
};
