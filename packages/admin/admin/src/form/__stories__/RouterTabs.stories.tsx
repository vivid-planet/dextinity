import { Card, CardContent } from "@mui/material";

import { FillSpace } from "../../common/FillSpace";
import { ToolbarActions } from "../../common/toolbar/actions/ToolbarActions";
import { ToolbarBackButton } from "../../common/toolbar/backbutton/ToolbarBackButton";
import { Toolbar } from "../../common/toolbar/Toolbar";
import { FinalForm } from "../../FinalForm";
import { FinalFormSaveButton } from "../../FinalFormSaveButton";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Stack } from "../../stack/Stack";
import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";

export default {
    title: "components/form",
};

export const FormWithRouterTabs = {
    render: () => {
        return (
            <Stack topLevelTitle="Root Stack">
                <RouterTabs>
                    <RouterTab label="Top 1" path="">
                        <RouterTabs>
                            <RouterTab label="Form 1" path="" forceRender={true}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <FinalForm
                                            mode="edit"
                                            onSubmit={(values: any) => {
                                                alert(JSON.stringify(values));
                                            }}
                                            initialValues={{
                                                foo: "foo",
                                                bar: "bar",
                                            }}
                                        >
                                            {({ pristine, dirty, hasValidationErrors, submitting, hasSubmitErrors, handleSubmit, ...formVars }) => {
                                                return (
                                                    <>
                                                        Pristine: {String(pristine)} <br />
                                                        Dirty: {String(dirty)}
                                                        <Toolbar>
                                                            <ToolbarBackButton />
                                                            <FillSpace />
                                                            <ToolbarActions>
                                                                <FinalFormSaveButton />
                                                            </ToolbarActions>
                                                        </Toolbar>
                                                        <Card variant="outlined">
                                                            <Field label="Foo" name="foo" component={FinalFormInput} />
                                                        </Card>
                                                    </>
                                                );
                                            }}
                                        </FinalForm>
                                    </CardContent>
                                </Card>
                            </RouterTab>
                            <RouterTab label="Outside Form" path="/outside-form" forceRender={true}>
                                <Card variant="outlined">
                                    <CardContent>Outside Form</CardContent>
                                </Card>
                            </RouterTab>
                        </RouterTabs>
                    </RouterTab>
                    <RouterTab label="Top 2" path="/top2">
                        <Card variant="outlined">
                            <CardContent>Top2</CardContent>
                        </Card>
                    </RouterTab>
                </RouterTabs>
            </Stack>
        );
    },

    name: "Form with router tabs",
};
