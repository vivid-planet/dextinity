import { Field, FinalForm, FinalFormInput, FormSection, SaveButton } from "@dextinity/admin";

export default {
    title: "Docs/Form/Overview",
};

export const BasicFinalForm = {
    render: () => {
        return (
            <FinalForm
                mode="add"
                onSubmit={(values) => {
                    window.alert(JSON.stringify(values));
                }}
            >
                <FormSection>
                    <Field label="First name" name="firstname" placeholder="John" component={FinalFormInput} fullWidth />
                    <Field label="Last name" name="lastname" placeholder="Doe" component={FinalFormInput} fullWidth />
                </FormSection>
                <SaveButton type="submit" />
            </FinalForm>
        );
    },

    name: "Basic FinalForm",
};
