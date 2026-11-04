import { Form } from "react-final-form";

import { FieldSet } from "../../common/FieldSet";
import { TextField } from "../../form/fields/TextField";

export default {
    title: "components/form",
};

export const FieldContainer = () => {
    return (
        <Form
            onSubmit={() => {
                // do nothing
            }}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <FieldSet title="HORIZONTAL (Full-width)">
                        <TextField name="textFieldWithLabelOne" label="TextField label" variant="horizontal" fullWidth />
                        <TextField name="textFieldWithLabelTwo" label="TextField label" variant="horizontal" fullWidth />
                        <TextField name="testWithoutLabel" variant="horizontal" placeholder="TextField without label" fullWidth />
                    </FieldSet>
                    <FieldSet title="VERTICAL (Full-width)">
                        <TextField name="textFieldWithLabelOne" label="TextField label" variant="vertical" fullWidth />
                        <TextField name="textFieldWithLabelTwo" label="TextField label" variant="vertical" fullWidth />
                        <TextField name="testWithoutLabel" variant="vertical" placeholder="TextField without label" fullWidth />
                    </FieldSet>
                    <FieldSet title="HORIZONTAL (auto-width)">
                        <TextField name="textFieldWithLabelOne" label="TextField label" variant="horizontal" />
                        <TextField name="textFieldWithLabelTwo" label="TextField label" variant="horizontal" />
                        <TextField name="testWithoutLabel" variant="horizontal" placeholder="TextField without label" />
                    </FieldSet>
                    <FieldSet title="VERTICAL (auto-width)">
                        <TextField name="textFieldWithLabelOne" label="TextField label" variant="vertical" />
                        <TextField name="textFieldWithLabelTwo" label="TextField label" variant="vertical" />
                        <TextField name="testWithoutLabel" variant="vertical" placeholder="TextField without label" />
                    </FieldSet>
                </form>
            )}
        />
    );
};
