import { Button, Field, FieldContainer, FinalForm, FinalFormRadio } from "@dextinity/admin";
import { FormControlLabel } from "@mui/material";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Radio",
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
                <FieldContainer label="FinalFormRadio" fullWidth>
                    <Field name="radio" type="radio" value="option1">
                        {(props) => <FormControlLabel label="Option 1" control={<FinalFormRadio {...props} />} />}
                    </Field>
                    <Field name="radio" type="radio" value="option2">
                        {(props) => <FormControlLabel label="Option 2" control={<FinalFormRadio {...props} />} />}
                    </Field>
                </FieldContainer>
                <FieldContainer label="FinalFormRadio disabled" fullWidth disabled>
                    <Field name="radio" type="radio" value="disabledOption1" disabled>
                        {(props) => <FormControlLabel label="Disabled Option 1" control={<FinalFormRadio {...props} />} />}
                    </Field>
                    <Field name="radio" type="radio" value="disabledOption2" disabled>
                        {(props) => <FormControlLabel label="Disabled Option 2" control={<FinalFormRadio {...props} />} />}
                    </Field>
                </FieldContainer>
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormRadio",
};
