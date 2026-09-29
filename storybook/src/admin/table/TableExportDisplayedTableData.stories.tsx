import {
    ExcelExportButton,
    FillSpace,
    type IRow,
    MainContent,
    Table,
    Toolbar,
    ToolbarActions,
    ToolbarItem,
    useExportDisplayedTableData,
} from "@dextinity/admin";
import { Typography } from "@mui/material";

interface IExampleRow extends IRow {
    id: number;
    foo1: string | number | null;
    foo2: string;
    currency: number;
    nestedFoo: {
        foo: string;
    };
}

const CustomHeader = () => {
    return <div>Custom Header</div>;
};

export default {
    title: "@dextinity/admin/table",
};

export const ExportDisplayedTableData = () => {
    const data: IExampleRow[] = [
        { id: 1, foo1: "blub", foo2: "blub", currency: 22.3, nestedFoo: { foo: "bar" } },
        { id: 2, foo1: "blub", foo2: "blub", currency: -100, nestedFoo: { foo: "bar" } },
        { id: 3, foo1: 1, foo2: "blub", currency: 33, nestedFoo: { foo: "bar" } },
        { id: 4, foo1: null, foo2: "blub", currency: -88.6682, nestedFoo: { foo: "bar" } },
        { id: 5, foo1: 32, foo2: "blub", currency: 10000.46584, nestedFoo: { foo: "bar" } },
    ];
    const exportApi = useExportDisplayedTableData({ fileName: "Custom File Name", worksheetName: "Custom Worksheet Name" });

    return (
        <>
            <Toolbar>
                <ToolbarItem>
                    <Typography variant="h3">Export Displayed Table Data</Typography>
                </ToolbarItem>
                <FillSpace />
                <ToolbarActions>
                    <ExcelExportButton exportApi={exportApi} />
                </ToolbarActions>
            </Toolbar>

            <MainContent>
                <Table
                    exportApis={[exportApi]}
                    data={data}
                    totalCount={data.length}
                    columns={[
                        {
                            name: "foo1",
                            header: "Foo1", // if header is a string -> excel export can export header
                        },
                        {
                            name: "foo2",
                            header: "Expo",
                            render: (row) => <strong>{row.id}</strong>,
                            renderExcel: (row) => row.id.toString(), // HTML Nodes / React Nodes (from above render) can not be exported to excel -> use renderExcel to generate an exportable string
                        },
                        {
                            name: "bar",
                            visible: false, // hidden columns will be exported hidden
                        },
                        {
                            name: "currency",
                            header: "Currency",
                            formatForExcel: `#,##0.00 "€";[Red]"-"#,##0.00" €"`,
                        },
                        {
                            name: "nestedFoo.foo",
                            header: "Nested foo",
                        },
                        {
                            name: "customheader",
                            header: <CustomHeader />,
                            headerExcel: "Overrided Excel Export Header", // HTML Nodes / React Nodes (from above header) can not be exported to excel -> use headerExcel to set an exportable column header
                            render: (row) => "Custom Row Content", // if render returns a string -> excel export can export this string
                        },
                    ]}
                />
            </MainContent>
        </>
    );
};
