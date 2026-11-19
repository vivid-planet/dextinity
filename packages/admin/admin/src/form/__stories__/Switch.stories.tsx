import { Card, CardContent } from "@mui/material";
import { Form } from "react-final-form";

import { SwitchField } from "../../form/fields/SwitchField";

export default {
    title: "components/form",
};

export const Switch = () => {
    return (
        <div style={{ width: 500 }}>
            <Form
                onSubmit={(values) => {
                    //
                }}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Card variant="outlined">
                            <CardContent>
                                <SwitchField fullWidth name="simpleSwitch" fieldLabel="Simple switch" label="With label on the right" />
                                <SwitchField
                                    fullWidth
                                    name="dynamicLabel"
                                    fieldLabel="Switch with dynamic label"
                                    label={(checked) => (checked ? "Yes" : "No")}
                                />
                                <SwitchField fullWidth name="disabled" fieldLabel="Disabled switch" label="Disabled" disabled />
                            </CardContent>
                        </Card>
                    </form>
                )}
            />
        </div>
    );
};

export const SwitchSizes = () => {
    return (
        <Form
            onSubmit={() => {
                // not handled
            }}
            initialValues={{ mediumChecked: true, smallChecked: true }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Card variant="outlined">
                        <CardContent>
                            <SwitchField name="medium" fieldLabel="Medium" label="Unchecked" />
                            <SwitchField name="mediumChecked" fieldLabel="Medium checked" label="Checked" />
                            <SwitchField name="mediumDisabled" fieldLabel="Medium disabled" label="Disabled" disabled />
                            <SwitchField name="small" fieldLabel="Small" label="Unchecked" componentsProps={{ finalFormSwitch: { size: "small" } }} />
                            <SwitchField
                                name="smallChecked"
                                fieldLabel="Small checked"
                                label="Checked"
                                componentsProps={{ finalFormSwitch: { size: "small" } }}
                            />
                            <SwitchField
                                name="smallDisabled"
                                fieldLabel="Small disabled"
                                label="Disabled"
                                disabled
                                componentsProps={{ finalFormSwitch: { size: "small" } }}
                            />
                        </CardContent>
                    </Card>
                </form>
            )}
        />
    );
};
