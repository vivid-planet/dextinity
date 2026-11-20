import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { Field } from "../../../components/field/Field";
import { FieldValidationMessage } from "../../../components/fieldValidationMessage/FieldValidationMessage";
import { Input } from "../../../components/input/Input";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./forms.module.scss";

const meta = {
    title: "Patterns/Forms",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fields: Story = {
    render: () => (
        <Field label="Title" required description="Shown in the browser tab and in search results.">
            <Input />
        </Field>
    ),
};

export const Form: Story = {
    render: () => (
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <fieldset className={styles.section}>
                <Typography variant="section" render={<legend className={styles.sectionTitle} />}>
                    Page
                </Typography>
                <div className={styles.row}>
                    <Field label="Title" required>
                        <Input defaultValue="About us" />
                    </Field>
                    <Field label="Slug" required>
                        <Input defaultValue="about-us" />
                    </Field>
                </div>
            </fieldset>
            <fieldset className={styles.section}>
                <Typography variant="section" render={<legend className={styles.sectionTitle} />}>
                    Search engines
                </Typography>
                <Field label="Meta title" description="Leave empty to use the title.">
                    <Input />
                </Field>
            </fieldset>
            <div className={styles.actions}>
                <Button variant="outlined">Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    ),
};

export const Validation: Story = {
    render: () => (
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.fields}>
                <Field label="Slug" required state="error" validationMessage="Use only lowercase letters, digits, and hyphens.">
                    <Input defaultValue="About us" />
                </Field>
                <Field label="Meta title" state="warning" validationMessage="Search engines may cut titles longer than 60 characters.">
                    <Input defaultValue="About us – our team, our history, our values, and our locations" />
                </Field>
                <Field label="Domain" state="success" validationMessage="The domain points to this website.">
                    <Input defaultValue="example.com" />
                </Field>
            </div>
            <FieldValidationMessage state="error">The page could not be saved. Try again.</FieldValidationMessage>
            <div className={styles.actions}>
                <Button type="submit">Save</Button>
            </div>
        </form>
    ),
};
