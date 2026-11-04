import { Edit } from "@dextinity/admin-icons";
import { Box, Card, CardContent, IconButton, Paper, Typography } from "@mui/material";
import { useContext } from "react";
import { Switch } from "react-router";

import { MainContent } from "../../common/MainContent";
import { ToolbarBackButton } from "../../common/toolbar/backbutton/ToolbarBackButton";
import { ToolbarItem } from "../../common/toolbar/item/ToolbarItem";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackSwitch, StackSwitchApiContext } from "../../stack/Switch";
import { Table } from "../../table/Table";

const SampleTable = () => {
    const stackApi = useContext(StackSwitchApiContext);

    return (
        <>
            <Box marginBottom={4}>
                <Toolbar>
                    <ToolbarBackButton />
                    <ToolbarItem>
                        <Typography variant="h3">Sample Table</Typography>
                    </ToolbarItem>
                </Toolbar>
            </Box>
            <Paper elevation={0}>
                <Table
                    data={[
                        { id: "1", name: "Lorem" },
                        { id: "2", name: "ipsum" },
                    ]}
                    totalCount={2}
                    columns={[
                        {
                            name: "id",
                            header: "id",
                        },
                        {
                            name: "name",
                            header: "Title",
                        },
                        {
                            name: "actions",
                            render: (recipe) => (
                                <IconButton color="primary" onClick={() => stackApi.activatePage("edit", recipe.id)} size="large">
                                    <Edit />
                                </IconButton>
                            ),
                        },
                    ]}
                />
            </Paper>
        </>
    );
};

const SampleForm = () => {
    const onSubmit = async () => {
        alert("Submit successful");
        return Promise.resolve();
    };

    return (
        <>
            <Toolbar>
                <ToolbarBackButton />
                <ToolbarItem>
                    <Typography variant="h3">Sample Form</Typography>
                </ToolbarItem>
            </Toolbar>
            <MainContent>
                <FinalForm
                    mode="edit"
                    onSubmit={onSubmit}
                    onAfterSubmit={(values, form) => {
                        form.reset(values); //Reset values to new values so dirty state is correct after submitting
                    }}
                >
                    <Card variant="outlined">
                        <CardContent>
                            <Field label="Foo" name="foo" component={FinalFormInput} />
                        </CardContent>
                    </Card>
                </FinalForm>
            </MainContent>
        </>
    );
};

export default {
    title: "components/form",
};

export const DisableAutoNavigation = () => {
    return (
        <Switch>
            <Stack topLevelTitle="Sample">
                <StackSwitch initialPage="table">
                    <StackPage name="table">
                        <SampleTable />
                    </StackPage>
                    <StackPage name="edit" title="Edit">
                        <SampleForm />
                    </StackPage>
                </StackSwitch>
            </Stack>
        </Switch>
    );
};
