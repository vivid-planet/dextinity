import {
    Button,
    ConfirmDialog,
    EditLayout,
    type FocalPoint,
    PageHeader,
    Panel,
    SaveState,
    type SelectOption,
    useKeyboardShortcut,
} from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, type ReactNode, useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { CheckboxField } from "../fields/checkboxField/CheckboxField";
import { FocalPointPickerField } from "../fields/focalPointPickerField/FocalPointPickerField";
import { InputField } from "../fields/inputField/InputField";
import { RichTextEditorField } from "../fields/richTextEditorField/RichTextEditorField";
import { SegmentedControlField } from "../fields/segmentedControlField/SegmentedControlField";
import { SelectField } from "../fields/selectField/SelectField";
import { SliderField } from "../fields/sliderField/SliderField";
import { SwitchField } from "../fields/switchField/SwitchField";
import { TextareaField } from "../fields/textareaField/TextareaField";
import { useFormSaveState, useHasUnsavedChanges } from "../formState/useFormSaveState";
import { sampleImage } from "../storybook/sampleImage";

interface PageFormValues {
    title: string;
    slug: string;
    category: string | null;
    tags: string[];
    teaser: string;
    body: string;
    teaserLayout: "text" | "image";
    imageFocalPoint: FocalPoint;
    imageZoom: number;
    published: boolean;
    showInNavigation: boolean;
}

const initialPage: PageFormValues = {
    title: "Benefits",
    slug: "benefits",
    category: "company",
    tags: ["jobs"],
    teaser: "What we offer: flexible hours, a learning budget, and a team that thinks things through.",
    body: "<p>We build digital products that <b>stay in use</b> for many years.</p>",
    teaserLayout: "image",
    imageFocalPoint: { x: 0.56, y: 0.34 },
    imageZoom: 100,
    published: true,
    showInNavigation: false,
};

const categories: SelectOption[] = [
    { value: "company", label: "Company" },
    { value: "jobs", label: "Jobs" },
    { value: "news", label: "News" },
];

const tags: SelectOption[] = [
    { value: "jobs", label: "Jobs" },
    { value: "culture", label: "Culture" },
    { value: "vienna", label: "Vienna" },
    { value: "remote", label: "Remote" },
];

const takenSlugs = ["careers", "contact"];

const fieldsStyle: CSSProperties = { display: "grid", gap: "var(--dextinity-space-4)" };
const actionsStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "var(--dextinity-space-2)" };

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const slugPattern = { value: /^[a-z0-9-]*$/, message: "Use lowercase letters, digits, and dashes only" };

function Fields({ children }: { children: ReactNode }) {
    return <div style={fieldsStyle}>{children}</div>;
}

interface HeaderProps {
    control: Control<PageFormValues>;
    onSave: () => void;
    onReset: () => void;
}

function Header({ control, onSave, onReset }: HeaderProps) {
    const saveState = useFormSaveState({ control });
    const hasUnsavedChanges = useHasUnsavedChanges({ control });
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    useKeyboardShortcut("mod+s", (event) => {
        event.preventDefault();
        onSave();
    });

    return (
        <>
            <PageHeader
                eyebrow="Page · Austria · German"
                title="Benefits"
                actions={
                    <span style={actionsStyle}>
                        <SaveState {...saveState} />
                        <Button variant="text" color="secondary" disabled={!hasUnsavedChanges} onClick={onReset}>
                            Reset
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => setLeaveDialogOpen(hasUnsavedChanges)}>
                            Leave
                        </Button>
                        <Button type="submit" loading={saveState.state === "saving"}>
                            Save
                        </Button>
                    </span>
                }
            />
            <ConfirmDialog
                open={leaveDialogOpen}
                onOpenChange={setLeaveDialogOpen}
                title="Unsaved changes"
                description="Save them before you leave?"
                secondaryLabel="Discard"
                onSecondary={() => {
                    onReset();
                    setLeaveDialogOpen(false);
                }}
                confirmLabel="Save and continue"
                onConfirm={() => {
                    onSave();
                    setLeaveDialogOpen(false);
                }}
            />
        </>
    );
}

function ExamplePageForm() {
    const { control, handleSubmit, reset, setError } = useForm<PageFormValues>({
        defaultValues: initialPage,
        mode: "onTouched",
    });

    const save = handleSubmit(async (values) => {
        await wait(400);
        if (takenSlugs.includes(values.slug)) {
            setError("slug", { type: "server", message: "Another page already uses this URL" }, { shouldFocus: true });
            return;
        }
        reset(values);
    });

    return (
        <form onSubmit={save} noValidate>
            <EditLayout
                header={<Header control={control} onSave={save} onReset={() => reset()} />}
                aside={
                    <Panel title="Status">
                        <Fields>
                            <SwitchField control={control} name="published" description="Visible on the website">
                                Published
                            </SwitchField>
                            <CheckboxField control={control} name="showInNavigation">
                                Show in the navigation
                            </CheckboxField>
                        </Fields>
                    </Panel>
                }
                asideLabel="Status"
            >
                <Panel title="Content">
                    <Fields>
                        <InputField control={control} name="title" label="Title" required requiredMessage="Enter a title" maxLength={60} showCount />
                        <InputField
                            control={control}
                            name="slug"
                            label="URL"
                            prefix="example.com/"
                            required
                            requiredMessage="Enter a URL"
                            rules={{ pattern: slugPattern }}
                            helperText="Lowercase letters, digits, and dashes"
                        />
                        <TextareaField control={control} name="teaser" label="Teaser" maxLength={160} showCount />
                        <RichTextEditorField control={control} name="body" label="Text" required requiredMessage="Write a text" />
                    </Fields>
                </Panel>
                <Panel title="Classification">
                    <Fields>
                        <SelectField
                            control={control}
                            name="category"
                            label="Category"
                            options={categories}
                            required
                            requiredMessage="Choose a category"
                        />
                        <SelectField control={control} name="tags" label="Tags" options={tags} multiple searchable placeholder="Add tags" />
                    </Fields>
                </Panel>
                <Panel title="Teaser image">
                    <Fields>
                        <SegmentedControlField
                            control={control}
                            name="teaserLayout"
                            aria-label="Teaser layout"
                            options={[
                                { value: "text", label: "Text only" },
                                { value: "image", label: "With image" },
                            ]}
                        />
                        <FocalPointPickerField control={control} name="imageFocalPoint" src={sampleImage} alt="Landscape with a sun" />
                        <SliderField control={control} name="imageZoom" label="Zoom" min={100} max={200} />
                    </Fields>
                </Panel>
            </EditLayout>
        </form>
    );
}

const meta = {
    title: "Forms/React Hook Form/Example form",
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "An edit page built with the React Hook Form adapters: validation on blur and submit, a simulated save that rejects the URLs `careers` and `contact`, the save state in the header, reset, a confirmation before leaving with unsaved changes, and saving with the keyboard shortcut.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ExampleForm: Story = {
    name: "Example form",
    render: () => <ExamplePageForm />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByLabelText("Title");
        const slug = canvas.getByLabelText("URL");
        await expect(canvas.getByText("All changes saved")).toBeInTheDocument();

        await userEvent.clear(title);
        await userEvent.clear(slug);
        await userEvent.type(slug, "Our Benefits");
        await userEvent.tab();
        await expect(canvas.getByText("Use lowercase letters, digits, and dashes only")).toBeVisible();
        await expect(canvas.getByText("Unsaved changes")).toBeInTheDocument();

        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(canvas.getByText("Enter a title")).toBeVisible();
        await waitFor(() => expect(title).toHaveFocus());

        await userEvent.type(title, "Our benefits");
        await userEvent.clear(slug);
        await userEvent.type(slug, "careers");
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(await canvas.findByText("Another page already uses this URL")).toBeVisible();
        await expect(canvas.getByText("Not saved")).toBeInTheDocument();
        await waitFor(() => expect(slug).toHaveFocus());

        await userEvent.clear(slug);
        await userEvent.type(slug, "our-benefits");
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(await canvas.findByText("All changes saved", {}, { timeout: 3000 })).toBeInTheDocument();
        await expect(title).toHaveValue("Our benefits");

        await userEvent.type(title, " and perks");
        await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
        await expect(title).toHaveValue("Our benefits");

        await userEvent.type(title, "!");
        await userEvent.click(canvas.getByRole("button", { name: "Leave" }));
        await userEvent.click(await screen.findByRole("button", { name: "Discard" }));
        await expect(title).toHaveValue("Our benefits");
    },
};
