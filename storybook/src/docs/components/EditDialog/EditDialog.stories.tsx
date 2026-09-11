import {
    Button,
    EditDialog,
    EditDialogApiContext,
    Field,
    FillSpace,
    FinalForm,
    FinalFormInput,
    FinalFormSelect,
    type IEditDialogApi,
    type ISelectionApi,
    Table,
    Toolbar,
    ToolbarItem,
    useEditDialog,
    useEditDialogApi,
} from "@dextinity/admin";
import { Edit } from "@dextinity/admin-icons";
import { DialogContent, IconButton, MenuItem, Typography } from "@mui/material";
import { type FunctionComponent, useRef, useState } from "react";
import { useLocation } from "react-router";
import { v4 as uuid } from "uuid";

import { editDialogDecorator } from "./editDialog.decorator";

export default {
    title: "Docs/Components/Edit Dialog",
    decorators: [editDialogDecorator()],
};

export const Hook = {
    render: () => {
        const [EditDialog, , editDialogApi] = useEditDialog();

        return (
            <>
                <h2>useEditDialog Variant:</h2>
                <Button onClick={() => editDialogApi.openAddDialog()}>Open Edit Dialog</Button>
                <EditDialog>
                    <DialogContent>
                        <FinalForm
                            mode="add"
                            onSubmit={async ({ name }) => {
                                window.alert(`Name: ${name}`);
                            }}
                        >
                            <Field label="Name" name="name" component={FinalFormInput} fullWidth autoFocus required />
                        </FinalForm>
                    </DialogContent>
                </EditDialog>
            </>
        );
    },
    name: "useEditDialog",
};

export const Component = {
    render: () => {
        const editDialogApi = useRef<IEditDialogApi>(null);

        return (
            <>
                <h2>EditDialog Component Variant:</h2>
                <Button onClick={() => editDialogApi.current?.openAddDialog()}>Open Edit Dialog</Button>
                <EditDialog ref={editDialogApi}>
                    {() => {
                        return (
                            <DialogContent>
                                <FinalForm
                                    mode="add"
                                    onSubmit={async ({ name }) => {
                                        window.alert(`Name: ${name}`);
                                    }}
                                >
                                    <Field label="Name" name="name" component={FinalFormInput} fullWidth autoFocus required />
                                </FinalForm>
                            </DialogContent>
                        );
                    }}
                </EditDialog>
            </>
        );
    },
    name: "EditDialog",
};

export const UseEditDialogApi = {
    render: () => {
        const ChildComponentWithOpenButton: FunctionComponent = () => {
            const editDialogApi = useEditDialogApi();

            return <Button onClick={() => editDialogApi?.openAddDialog()}>Open Edit Dialog with useEditDialogApi()</Button>;
        };

        const [EditDialog, , editDialogApi] = useEditDialog();

        return (
            <EditDialogApiContext.Provider value={editDialogApi}>
                <ChildComponentWithOpenButton />
                <EditDialog>
                    <DialogContent>
                        <FinalForm
                            mode="add"
                            onSubmit={async ({ name }) => {
                                window.alert(`Name: ${name}`);
                            }}
                        >
                            <Field label="Name" name="name" component={FinalFormInput} fullWidth autoFocus required />
                        </FinalForm>
                    </DialogContent>
                </EditDialog>
            </EditDialogApiContext.Provider>
        );
    },
    name: "useEditDialogApi",
};

export const WithForm = {
    render: () => {
        const [EditDialog, , editDialogApi] = useEditDialog();

        return (
            <>
                <h2>Loading and Error State of EditDialog:</h2>
                <Button onClick={() => editDialogApi.openAddDialog()}>Open Edit Dialog</Button>
                <EditDialog>
                    <DialogContent>
                        <FinalForm
                            mode="add"
                            onSubmit={async ({ desiredOutcome }) => {
                                return new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        if (desiredOutcome === "success") {
                                            resolve();
                                        } else {
                                            reject("This is an Error Message");
                                        }
                                    }, 3000);
                                });
                            }}
                            initialValues={{
                                desiredOutcome: "success",
                            }}
                        >
                            <Field name="desiredOutcome" label="Desired Outcome" fullWidth>
                                {(props) => (
                                    <FinalFormSelect {...props} fullWidth required>
                                        <MenuItem value="success" selected>
                                            Success
                                        </MenuItem>
                                        <MenuItem value="error">Error</MenuItem>
                                    </FinalFormSelect>
                                )}
                            </Field>
                        </FinalForm>
                    </DialogContent>
                </EditDialog>
            </>
        );
    },
    name: "EditDialog with Form",
};

export const WithTable = {
    render: () => {
        interface User {
            id: string;
            name: string;
        }

        const [users, setUsers] = useState<User[]>([
            { id: "8a31ea9d-d00a-4e37-807b-a69624964ba0", name: "Isabella" },
            { id: "a5baf49a-d53c-4b3f-abd4-80d2b418589d", name: "Theo" },
            { id: "29734826-06b4-491b-ada7-cf1000d95790", name: "Maria" },
        ]);

        const addUser = (name: string) => {
            setUsers((users) => [
                ...users,
                {
                    id: uuid(),
                    name: name,
                },
            ]);
        };

        const updateUser = (id: string, name: string) => {
            const idx = users.findIndex((user) => user.id === id);

            if (idx == -1) {
                throw new Error("User doesn't exist");
            }

            setUsers((users) => {
                const newUsers = [...users];
                newUsers[idx].name = name;
                return newUsers;
            });
        };

        interface UserFormProps {
            mode?: "add" | "edit";
            id?: string;
            selectionApi: ISelectionApi;
        }

        const UserForm: FunctionComponent<UserFormProps> = ({ selectionApi, id, mode = "add" }) => {
            const selection = { id, mode };
            const user = selection.mode === "edit" ? users.find((user) => user.id === id) : undefined;

            return (
                <FinalForm<{ name: string }>
                    mode={selection.mode}
                    onSubmit={async ({ name }) => {
                        if (selection.mode === "edit") {
                            updateUser(selection.id as string, name);
                        } else {
                            addUser(name);
                        }
                    }}
                    onAfterSubmit={() => {
                        selectionApi.handleDeselect();
                    }}
                    initialValues={user}
                >
                    <Field label="Name" name="name" component={FinalFormInput} fullWidth autoFocus required />
                </FinalForm>
            );
        };

        const [EditDialog, { id: selectedId, mode: selectionMode }, editDialogApi, selectionApi] = useEditDialog();

        return (
            <>
                <Toolbar>
                    <FillSpace />
                    <ToolbarItem>
                        <Button onClick={() => editDialogApi.openAddDialog()}>Add User</Button>
                    </ToolbarItem>
                </Toolbar>
                <Table
                    data={users}
                    totalCount={users.length}
                    columns={[
                        { name: "name", header: "Name" },
                        {
                            name: "edit",
                            cellProps: {
                                align: "right",
                            },
                            render: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            editDialogApi.openEditDialog(row.id);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                );
                            },
                        },
                    ]}
                />
                <EditDialog>
                    <DialogContent>
                        <UserForm mode={selectionMode} id={selectedId} selectionApi={selectionApi} />
                    </DialogContent>
                </EditDialog>
            </>
        );
    },
    name: "EditDialog with Table",
};

export const SelectionWithHook = {
    render: () => {
        interface User {
            id: string;
            name: string;
        }

        const users: User[] = [
            { id: "8a31ea9d-d00a-4e37-807b-a69624964ba0", name: "Isabella" },
            { id: "a5baf49a-d53c-4b3f-abd4-80d2b418589d", name: "Theo" },
            { id: "29734826-06b4-491b-ada7-cf1000d95790", name: "Maria" },
        ];

        const location = useLocation();
        const [EditDialog, { id, mode }, editDialogApi] = useEditDialog();

        return (
            <>
                <h2>Click on a button to see the current selection values:</h2>
                <Toolbar>
                    <FillSpace />
                    <ToolbarItem>
                        <Button onClick={() => editDialogApi.openAddDialog()}>Add User</Button>
                    </ToolbarItem>
                </Toolbar>
                <Table
                    data={users}
                    totalCount={users.length}
                    columns={[
                        { name: "name", header: "Name" },
                        {
                            name: "edit",
                            cellProps: {
                                align: "right",
                            },
                            render: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            editDialogApi.openEditDialog(row.id);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                );
                            },
                        },
                    ]}
                />
                <EditDialog>
                    <DialogContent>
                        <Typography>
                            <strong>Mode:</strong> {mode}
                        </Typography>

                        <Typography>
                            <strong>ID:</strong> {id}
                        </Typography>

                        <Typography>
                            <strong>URL:</strong> {location.pathname}
                        </Typography>
                    </DialogContent>
                </EditDialog>
            </>
        );
    },
    name: "EditDialog and Selection (Hook)",
};

export const SelectionWithComponent = {
    render: () => {
        interface User {
            id: string;
            name: string;
        }

        const users: User[] = [
            { id: "8a31ea9d-d00a-4e37-807b-a69624964ba0", name: "Isabella" },
            { id: "a5baf49a-d53c-4b3f-abd4-80d2b418589d", name: "Theo" },
            { id: "29734826-06b4-491b-ada7-cf1000d95790", name: "Maria" },
        ];

        const location = useLocation();
        const editDialogApi = useRef<IEditDialogApi>(null);

        return (
            <>
                <h2>Click on a button to see the current selection values:</h2>
                <Toolbar>
                    <FillSpace />
                    <ToolbarItem>
                        <Button onClick={() => editDialogApi.current?.openAddDialog()}>Add User</Button>
                    </ToolbarItem>
                </Toolbar>
                <Table
                    data={users}
                    totalCount={users.length}
                    columns={[
                        { name: "name", header: "Name" },
                        {
                            name: "edit",
                            cellProps: {
                                align: "right",
                            },
                            render: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            editDialogApi.current?.openEditDialog(row.id);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                );
                            },
                        },
                    ]}
                />
                <EditDialog ref={editDialogApi}>
                    {({ selectionMode, selectedId }) => {
                        return (
                            <DialogContent>
                                <Typography>
                                    <strong>Mode:</strong> {selectionMode}
                                </Typography>

                                <Typography>
                                    <strong>ID:</strong> {selectedId}
                                </Typography>

                                <Typography>
                                    <strong>URL:</strong> {location.pathname}
                                </Typography>
                            </DialogContent>
                        );
                    }}
                </EditDialog>
            </>
        );
    },

    name: "EditDialog and Selection (Component)",
};
