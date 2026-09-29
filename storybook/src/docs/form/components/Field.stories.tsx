import { Field, FinalForm, FinalFormInput } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/Field",
};

export const Basic = () => {
    return (
        <FinalForm mode="add" onSubmit={() => {}}>
            <Field type="text" name="normal" label="Normal" component={FinalFormInput} />
            <Field type="text" name="required" label="Required" component={FinalFormInput} required />
            <Field type="text" name="disabled" label="Disabled" component={FinalFormInput} disabled />
        </FinalForm>
    );
};
