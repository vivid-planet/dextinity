import { Add as AddIcon, Edit as EditIcon } from "@dextinity/admin-icons";
import { DialogContent, IconButton, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../common/buttons/Button";
import { FillSpace } from "../../common/FillSpace";
import { MainContent } from "../../common/MainContent";
import { ToolbarActions } from "../../common/toolbar/actions/ToolbarActions";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { useEditDialog } from "../../editDialog/EditDialog";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Selected } from "../../Selected";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackSwitch } from "../../stack/Switch";
import { Table } from "../Table";

interface IExampleRow {
    id: number;
    foo: string;
    bar: string;
}

interface IEditFormProps {
    row?: IExampleRow;
    mode: "edit" | "add";
}
function EditForm(props: IEditFormProps) {
    return (
        <FinalForm
            mode={props.mode}
            initialValues={props.row}
            onSubmit={(values) => {
                alert(JSON.stringify(values));
            }}
        >
            <Field name="foo" component={FinalFormInput} type="text" label="Name" fullWidth />
        </FinalForm>
    );
}

const meta: Meta = {
    title: "components/table/TableStackEditDialogHooks",
};

export default meta;

type Story = StoryObj;

export const StackEditDialogHooks: Story = {
    render: () => {
        const data: IExampleRow[] = [
            { id: 1, foo: "blub", bar: "blub" },
            { id: 2, foo: "blub", bar: "blub" },
        ];

        const [EditDialog, selection, api] = useEditDialog();

        return (
            <>
                <Stack topLevelTitle="Stack">
                    <StackSwitch>
                        <StackPage name="table">
                            <Toolbar>
                                <ToolbarItem>
                                    <Typography variant="h3">Table Stack Edit Dialog</Typography>
                                </ToolbarItem>
                                <FillSpace />
                                <ToolbarActions>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={(ev) => {
                                            api.openAddDialog();
                                        }}
                                    >
                                        Add
                                    </Button>
                                </ToolbarActions>
                            </Toolbar>

                            <MainContent>
                                <Table
                                    data={data}
                                    totalCount={data.length}
                                    columns={[
                                        {
                                            name: "foo",
                                            header: "Foo",
                                        },
                                        {
                                            name: "bar",
                                            header: "Bar",
                                        },
                                        {
                                            name: "edit",
                                            header: "Edit",
                                            render: (row) => (
                                                <IconButton
                                                    onClick={(ev) => {
                                                        api.openEditDialog(String(row.id));
                                                    }}
                                                    size="large"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            ),
                                        },
                                    ]}
                                />
                            </MainContent>
                        </StackPage>
                        <StackPage name="form" title="bearbeiten">
                            edit....
                        </StackPage>
                    </StackSwitch>
                </Stack>

                <EditDialog>
                    <DialogContent>
                        {selection.mode && (
                            <Selected selectionMode={selection.mode} selectedId={selection.id} rows={data}>
                                {(row, { selectionMode: sm }) => {
                                    return <EditForm mode={sm} row={row} />;
                                }}
                            </Selected>
                        )}
                    </DialogContent>
                </EditDialog>
                <p>This story uses a Stack plus an EditDialog</p>
            </>
        );
    },

    name: "Stack + EditDialog Hooks",
};
