import { Button, Field, FinalForm, FinalFormInput } from "@dextinity/admin";

export default {
    title: "Docs/Form/Components/FinalForm Fields/FinalForm Input",
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
                <Field component={FinalFormInput} name="text" label="Text" placeholder="Some Text" fullWidth required />
                <Field
                    component={FinalFormInput}
                    name="textDisabled"
                    label="Text (disabled)"
                    placeholder="Some Text"
                    fullWidth
                    disabled
                    defaultValue="disabled"
                />
                <Field
                    component={FinalFormInput}
                    name="textReadOnly"
                    label="Text (read only)"
                    placeholder="Some Text"
                    defaultValue="read only"
                    fullWidth
                    readOnly
                />
                <Field component={FinalFormInput} name="textOptional" label="Text (optional)" placeholder="Some Text" fullWidth />
                <Field component={FinalFormInput} name="number" label="Number" type="number" placeholder="12" fullWidth required />
                <Field
                    component={FinalFormInput}
                    name="numberReadOnly"
                    label="Number (read only)"
                    type="number"
                    placeholder="12"
                    fullWidth
                    readOnly
                    defaultValue="12"
                />
                <Field
                    component={FinalFormInput}
                    name="numberDisabled"
                    label="Number (disabled)"
                    type="number"
                    placeholder="12"
                    fullWidth
                    disabled
                    defaultValue="12"
                />
                <Field component={FinalFormInput} name="numberOptional" label="Number (optional)" type="number" placeholder="12" fullWidth />
                <Field component={FinalFormInput} name="email" label="Email" type="email" placeholder="john.doe@example.com" fullWidth required />
                <Field
                    component={FinalFormInput}
                    name="emailReadOnly"
                    label="Email (read only)"
                    type="email"
                    placeholder="john.doe@example.com"
                    fullWidth
                    readOnly
                    defaultValue="john.doe@example.com"
                />
                <Field
                    component={FinalFormInput}
                    name="emailDisabled"
                    label="Email (disabled)"
                    type="email"
                    placeholder="john.doe@example.com"
                    fullWidth
                    disabled
                    defaultValue="john.doe@example.com"
                />

                <Field
                    component={FinalFormInput}
                    name="emailOptional"
                    label="Email (optional)"
                    type="email"
                    placeholder="john.doe@example.com"
                    fullWidth
                />
                <Field component={FinalFormInput} name="password" label="Password" type="password" placeholder="Password" fullWidth required />
                <Field
                    component={FinalFormInput}
                    name="passwordReadOnly"
                    label="Password (read only)"
                    type="password"
                    placeholder="Password"
                    fullWidth
                    readOnly
                    defaultValue="Password"
                />
                <Field
                    component={FinalFormInput}
                    name="passwordDisabled"
                    label="Password (disabled)"
                    type="password"
                    placeholder="Password"
                    fullWidth
                    disabled
                    defaultValue="Password"
                />

                <Field
                    component={FinalFormInput}
                    name="passwordOptional"
                    label="Password (optional)"
                    type="password"
                    placeholder="Password"
                    fullWidth
                />
                <Button type="submit">Submit</Button>
            </FinalForm>
        );
    },

    name: "FinalFormInput",
};
