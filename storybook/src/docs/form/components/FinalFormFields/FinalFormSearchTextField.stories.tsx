import { Button, Field, FinalForm, FinalFormSearchTextField } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Search Text Field",
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
                <Field name="search" label="FinalFormSearchTextField" component={FinalFormSearchTextField} fullWidth required />

                <Field
                    name="searchReadOnly"
                    label="FinalFormSearchTextField (read only)"
                    defaultValue="read only value"
                    component={FinalFormSearchTextField}
                    fullWidth
                    readOnly
                />
                <Field
                    name="searchDisabled"
                    label="FinalFormSearchTextField (disabled)"
                    defaultValue="disabled value"
                    component={FinalFormSearchTextField}
                    fullWidth
                    disabled
                />
                <Field name="searchOptional" label="FinalFormSearchTextField (optional)" component={FinalFormSearchTextField} fullWidth />

                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormSearchTextField",
};
