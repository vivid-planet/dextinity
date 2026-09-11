import { CopyToClipboardButton, HoverActions, Table } from "@dextinity/admin";
import { Download, Maximize } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";

export default {
    title: "Docs/Components/HoverActions",
};

export const Basic = {
    render: () => {
        interface Row {
            id: number;
            foo: string;
            bar: string;
        }

        const data: Row[] = [
            { id: 1, foo: "Dapibus ac facilisis", bar: "Vestibulum id ligula" },
            { id: 2, foo: "ornare sem lacinia quam", bar: "Pellentesque ornare sem lacinia quam venenatis" },
            { id: 3, foo: "Nullam id dolor id nibh ultricies vehicula", bar: "Vivamus sagittis lacus vel" },
            { id: 4, foo: "Cras justo odio", bar: "Maecenas sed diam eget risus varius blandit" },
        ];

        return (
            <Table<Row>
                data={data}
                totalCount={data.length}
                columns={[
                    {
                        name: "id",
                        header: "ID",
                    },
                    {
                        name: "foo",
                        header: "Foo",
                        render: ({ foo }) => <HoverActions actions={<CopyToClipboardButton copyText={foo} />}>{foo}</HoverActions>,
                    },
                    {
                        name: "bar",
                        header: "Bar",
                        render: ({ bar }) => <HoverActions actions={<CopyToClipboardButton copyText={bar} />}>{bar}</HoverActions>,
                    },
                    {
                        name: "fooBar",
                        header: "FooBar",
                        render: ({ foo, bar }) => (
                            <HoverActions
                                actions={
                                    <>
                                        <CopyToClipboardButton copyText={`${foo} ${bar}`} />
                                        <IconButton color="primary" onClick={() => console.log("Something is downloading... 👀")}>
                                            <Download />
                                        </IconButton>
                                        <IconButton color="primary">
                                            <Maximize />
                                        </IconButton>
                                    </>
                                }
                            >
                                {foo} {bar}
                            </HoverActions>
                        ),
                    },
                ]}
            />
        );
    },
    name: "HoverActions",
};
