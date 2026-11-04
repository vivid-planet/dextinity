import { SaveButton } from "../../common/buttons/SaveButton";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";
import { FormSection } from "../../form/FormSection";

export default {
    title: "stories/form/FinalForm",
};

export const DisabledSubmitIfNotDirty = () => {
    return (
        <FinalForm
            mode="add"
            onSubmit={async (values) => {
                window.alert(JSON.stringify(values));
            }}
        >
            {({ dirty }) => (
                <>
                    <FormSection>
                        <Field label="First name" name="firstname" component={FinalFormInput} fullWidth />
                        <Field label="Last name" name="lastname" component={FinalFormInput} fullWidth />
                    </FormSection>
                    <SaveButton type="submit" disabled={!dirty} />
                </>
            )}
        </FinalForm>
    );
};
