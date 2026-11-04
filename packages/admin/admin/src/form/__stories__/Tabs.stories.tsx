import { Card, CardContent } from "@mui/material";
import { useState } from "react";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { Tab, Tabs } from "../../tabs/Tabs";

export default {
    title: "components/form",
};

export const _Tabs = () => {
    const [showExample3, setShowExample3] = useState(false);

    return (
        <>
            <Button onClick={() => setShowExample3((value) => !value)}>{showExample3 ? "Hide" : "Show"} Example 3</Button>
            <FinalForm
                mode="edit"
                onSubmit={(values) => {
                    alert(JSON.stringify(values));
                }}
                initialValues={{
                    foo: "foo",
                    bar: "bar",
                }}
            >
                <Tabs>
                    <Tab label="Example 1">
                        <Card variant="outlined">
                            <CardContent>
                                <Field label="Foo" name="foo" component={FinalFormInput} />
                            </CardContent>
                        </Card>
                    </Tab>
                    <Tab label="Example 2" forceRender>
                        <Card variant="outlined">
                            <CardContent>
                                <Field label="Bar" name="bar" component={FinalFormInput} />
                            </CardContent>
                        </Card>
                    </Tab>
                    {showExample3 && (
                        <Tab label="Example 3">
                            <Card variant="outlined">
                                <CardContent>False</CardContent>
                            </Card>
                        </Tab>
                    )}
                </Tabs>
            </FinalForm>
        </>
    );
};
