import { Field } from "@dextinity/admin";
import { createFinalFormRte } from "@dextinity/admin-rte";
import { Form } from "react-final-form";

const { RteField } = createFinalFormRte();

export default {
    title: "@dextinity/admin-rte",
};

export const ToolbarButtonsSubmitForm = {
    render: () => {
        return (
            <Form
                onSubmit={() => alert("submit")}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Field name="text" component={RteField} />
                    </form>
                )}
            />
        );
    },

    name: "Toolbar buttons submit form",
};
