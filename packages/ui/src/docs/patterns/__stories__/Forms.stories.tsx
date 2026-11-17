import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { FieldDescription } from "../../../components/fieldDescription/FieldDescription";
import { FieldLabel } from "../../../components/fieldLabel/FieldLabel";
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

export const Field: Story = {
    render: () => (
        <div className={styles.field}>
            <FieldLabel htmlFor="field-title" required>
                Title
            </FieldLabel>
            <Input id="field-title" required aria-describedby="field-title-description" />
            <FieldDescription id="field-title-description">Shown in the browser tab and in search results.</FieldDescription>
        </div>
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
                    <div className={styles.field}>
                        <FieldLabel htmlFor="form-title" required>
                            Title
                        </FieldLabel>
                        <Input id="form-title" required defaultValue="About us" />
                    </div>
                    <div className={styles.field}>
                        <FieldLabel htmlFor="form-slug" required>
                            Slug
                        </FieldLabel>
                        <Input id="form-slug" required defaultValue="about-us" />
                    </div>
                </div>
            </fieldset>
            <fieldset className={styles.section}>
                <Typography variant="section" render={<legend className={styles.sectionTitle} />}>
                    Search engines
                </Typography>
                <div className={styles.field}>
                    <FieldLabel htmlFor="form-meta-title">Meta title</FieldLabel>
                    <Input id="form-meta-title" aria-describedby="form-meta-title-description" />
                    <FieldDescription id="form-meta-title-description">Leave empty to use the title.</FieldDescription>
                </div>
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
                <div className={styles.field}>
                    <FieldLabel htmlFor="validation-slug" required error>
                        Slug
                    </FieldLabel>
                    <Input id="validation-slug" required state="error" defaultValue="About us" aria-describedby="validation-slug-error" />
                    <FieldValidationMessage id="validation-slug-error" state="error">
                        Use only lowercase letters, digits, and hyphens.
                    </FieldValidationMessage>
                </div>
                <div className={styles.field}>
                    <FieldLabel htmlFor="validation-meta-title">Meta title</FieldLabel>
                    <Input
                        id="validation-meta-title"
                        state="warning"
                        defaultValue="About us – our team, our history, our values, and our locations"
                        aria-describedby="validation-meta-title-message"
                    />
                    <FieldValidationMessage id="validation-meta-title-message" state="warning">
                        Search engines may cut titles longer than 60 characters.
                    </FieldValidationMessage>
                </div>
                <div className={styles.field}>
                    <FieldLabel htmlFor="validation-domain">Domain</FieldLabel>
                    <Input id="validation-domain" state="success" defaultValue="example.com" aria-describedby="validation-domain-message" />
                    <FieldValidationMessage id="validation-domain-message" state="success">
                        The domain points to this website.
                    </FieldValidationMessage>
                </div>
            </div>
            <FieldValidationMessage state="error">The page could not be saved. Try again.</FieldValidationMessage>
            <div className={styles.actions}>
                <Button type="submit">Save</Button>
            </div>
        </form>
    ),
};
