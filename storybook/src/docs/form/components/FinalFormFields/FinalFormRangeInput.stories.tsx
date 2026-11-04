import { Button, Field, FinalForm, FinalFormRangeInput } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Range Input",
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
                <Field name="price" label="FinalFormRangeInput" component={FinalFormRangeInput} startAdornment="€" fullWidth min={50} max={1000} />
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormRangeInput",
};
