import { Button, CheckboxField, FinalForm } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Checkbox",
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
                <CheckboxField name="checkbox" fieldLabel="FinalFormCheckbox" label="Confirm" fullWidth />
                <CheckboxField name="checkboxDisabled" fieldLabel="FinalFormCheckbox disabled" label="Confirm" fullWidth disabled />
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormCheckbox",
};
