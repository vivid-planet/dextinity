import { Field, FinalForm, FinalFormInput } from "@dextinity/admin";
import { FORM_ERROR } from "final-form";

export default {
    title: "Docs/Form/Validation",
};

export const RecordLevelValidation = {
    render: () => {
        interface FormValues {
            name: string;
            email: string;
        }

        const validate = (values: FormValues) => {
            if (values.name === "Max Mustermann" || values.email.endsWith("@example.com")) {
                return {
                    name: values.name === "Max Mustermann" ? "Example name" : undefined,
                    email: values.email.endsWith("@example.com") ? "Example email" : undefined,
                    [FORM_ERROR]: "Example values not allowed",
                };
            }
        };

        return (
            <FinalForm<FormValues>
                mode="add"
                onSubmit={() => {
                    // noop
                }}
                validate={validate}
                initialValues={{ name: "", email: "" }}
            >
                <Field type="text" name="name" label="Name" placeholder="Must not be 'Max Mustermann'" component={FinalFormInput} fullWidth />
                <Field type="email" name="email" label="Email" placeholder="Must not end with '@example.com'" component={FinalFormInput} fullWidth />
            </FinalForm>
        );
    },

    name: "Record-level validation",
};

export const FieldLevelValidation = {
    render: () => {
        interface FormValues {
            name: string;
            email: string;
        }

        const validateName = (name: string) => {
            if (name === "Max Mustermann") {
                return "Example name";
            }
        };

        const validateEmail = (email: string) => {
            if (email.endsWith("@example.com")) {
                return "Example email";
            }
        };

        return (
            <FinalForm<FormValues>
                mode="add"
                onSubmit={() => {
                    // noop
                }}
                initialValues={{ name: "", email: "" }}
            >
                <Field
                    type="text"
                    name="name"
                    label="Name"
                    placeholder="Must not be 'Max Mustermann'"
                    component={FinalFormInput}
                    fullWidth
                    validate={validateName}
                />
                <Field
                    type="email"
                    name="email"
                    label="Email"
                    placeholder="Must not end with '@example.com'"
                    component={FinalFormInput}
                    fullWidth
                    validate={validateEmail}
                />
            </FinalForm>
        );
    },

    name: "Field-level validation",
};

export const Warnings = () => {
    interface FormValues {
        name: string;
        email: string;
    }

    const validateWarning = (values: FormValues) => {
        if (values.name === "Max Mustermann") {
            return { name: "Example name " };
        }
    };

    const validateWarningEmail = (email: string) => {
        if (email.endsWith("@example.com")) {
            return "Example email";
        }
    };

    return (
        <FinalForm<FormValues>
            mode="add"
            onSubmit={() => {
                // noop
            }}
            validateWarning={validateWarning}
            initialValues={{ name: "", email: "" }}
        >
            <Field type="text" name="name" label="Name" placeholder="Should not be 'Max Mustermann'" component={FinalFormInput} fullWidth />
            <Field
                type="email"
                name="email"
                label="Email"
                placeholder="Should not end with '@example.com'"
                component={FinalFormInput}
                validateWarning={validateWarningEmail}
                fullWidth
            />
        </FinalForm>
    );
};
