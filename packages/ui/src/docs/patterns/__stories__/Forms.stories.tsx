import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../../components/button/Button";
import { FormHelperText } from "../../../components/formHelperText/FormHelperText";
import { FormLabel } from "../../../components/formLabel/FormLabel";
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
            <FormLabel htmlFor="field-title" required>
                Title
            </FormLabel>
            <Input id="field-title" required aria-describedby="field-title-hint" />
            <FormHelperText id="field-title-hint">Shown in the browser tab and in search results.</FormHelperText>
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
                        <FormLabel htmlFor="form-title" required>
                            Title
                        </FormLabel>
                        <Input id="form-title" required defaultValue="About us" />
                    </div>
                    <div className={styles.field}>
                        <FormLabel htmlFor="form-slug" required>
                            Slug
                        </FormLabel>
                        <Input id="form-slug" required defaultValue="about-us" />
                    </div>
                </div>
            </fieldset>
            <fieldset className={styles.section}>
                <Typography variant="section" render={<legend className={styles.sectionTitle} />}>
                    Search engines
                </Typography>
                <div className={styles.field}>
                    <FormLabel htmlFor="form-meta-title">Meta title</FormLabel>
                    <Input id="form-meta-title" aria-describedby="form-meta-title-hint" />
                    <FormHelperText id="form-meta-title-hint">Leave empty to use the title.</FormHelperText>
                </div>
            </fieldset>
            <div className={styles.actions}>
                <Button variant="secondary">Cancel</Button>
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
                    <FormLabel htmlFor="validation-slug" required error>
                        Slug
                    </FormLabel>
                    <Input id="validation-slug" required status="error" defaultValue="About us" aria-describedby="validation-slug-error" />
                    <FormHelperText id="validation-slug-error" error>
                        Use only lowercase letters, digits, and hyphens.
                    </FormHelperText>
                </div>
                <div className={styles.field}>
                    <FormLabel htmlFor="validation-meta-title">Meta title</FormLabel>
                    <Input
                        id="validation-meta-title"
                        status="warning"
                        defaultValue="About us – our team, our history, our values, and our locations"
                        aria-describedby="validation-meta-title-hint"
                    />
                    <FormHelperText id="validation-meta-title-hint">Search engines may cut titles longer than 60 characters.</FormHelperText>
                </div>
                <div className={styles.field}>
                    <FormLabel htmlFor="validation-domain">Domain</FormLabel>
                    <Input id="validation-domain" status="success" defaultValue="example.com" aria-describedby="validation-domain-hint" />
                    <FormHelperText id="validation-domain-hint">The domain points to this website.</FormHelperText>
                </div>
            </div>
            <FormHelperText error>The page could not be saved. Try again.</FormHelperText>
            <div className={styles.actions}>
                <Button type="submit">Save</Button>
            </div>
        </form>
    ),
};
