import { Master } from "@dextinity/admin-icons";
import { Box, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFormState } from "react-final-form";

import { Button } from "../../common/buttons/Button";
import { FinalForm } from "../../FinalForm";
import { Field } from "../../form/Field";
import { FinalFormInput } from "../../form/FinalFormInput";

const StyledButton = styled(Button)`
    text-transform: capitalize;
    background-color: #006699;
    color: white;

    &:disabled {
        color: lightgrey;
        background-color: slategrey;
    }

    &:hover {
        background-color: #006699;
    }
`;

const CustomButtons = () => {
    const { values, pristine, hasValidationErrors, submitting } = useFormState();

    return (
        <StyledButton
            startIcon={<Master />}
            variant="textDark"
            disabled={pristine || hasValidationErrors || submitting}
            onClick={handleCustomButtonClick}
        >
            {pristine ? "Please fill out the form" : "Click Me - I'm a Custom button"}
        </StyledButton>
    );

    function handleCustomButtonClick() {
        window.alert(`Form values: ${JSON.stringify(values)}`);
    }
};

export default {
    title: "components/form",
};

export const _CustomButtons = {
    render: () => {
        return (
            <div style={{ width: 300 }}>
                <FinalForm
                    mode="edit"
                    onSubmit={() => {
                        // add your form-submit function here
                    }}
                >
                    <Card variant="outlined">
                        <CardContent>
                            <Field label="Foo" name="foo" component={FinalFormInput} fullWidth />
                            <Field label="Bar" name="bar" component={FinalFormInput} fullWidth />
                        </CardContent>
                    </Card>
                    <Box paddingTop={4}>
                        <CustomButtons />
                    </Box>
                </FinalForm>
            </div>
        );
    },

    name: "CustomButtons",
};
