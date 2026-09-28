import { Button, FinalForm, SwitchField } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Switch",
};

export const Default = {
    render: () => {
        return (
            <FinalForm
                mode="add"
                onSubmit={(values) => {
                    alert(JSON.stringify(values, null, 4));
                }}
            >
                <SwitchField name="switch" fieldLabel="FinalFormSwitch" label={(checked) => (checked ? "On" : "Off")} fullWidth />
                <SwitchField
                    name="switchDisabled"
                    fieldLabel="FinalFormSwitch disabled"
                    label={(checked) => (checked ? "On" : "Off")}
                    fullWidth
                    disabled
                />
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormSwitch",
};
