import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Breadcrumbs } from "../../breadcrumbs/Breadcrumbs";
import { Icon } from "../../icon/Icon";
import { SaveState } from "../../saveState/SaveState";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { PageHeader } from "../PageHeader";
import pageHeaderTokens from "../PageHeader.tokens.scss?raw";
import styles from "./PageHeader.stories.module.scss";

const meta = {
    component: PageHeader,
    title: "Building blocks/Page header, breadcrumbs & links/PageHeader",
    decorators: [themeDecorator],
    parameters: { tokens: pageHeaderTokens },
    args: {
        title: "Page tree",
        eyebrow: "Austria · German · 23 pages",
        subtitle: "3 unpublished · 1 archived",
        primaryAction: { label: "New page", icon: <Icon name="plus" />, onClick: fn() },
    },
    argTypes: {
        eyebrow: { control: "text" },
        subtitle: { control: "text" },
        status: { control: false },
        primaryAction: { control: false },
        secondaryActions: { control: false },
        actionStatus: { control: false },
        back: { control: false },
        breadcrumbs: { control: false },
        onTitleChange: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Every page starts the same: context label, display title, status and more information, actions.
 *
 * **Rules**
 *
 * - One display title per page.
 * - At most two buttons: one primary and one secondary action. More secondary actions go into the menu of the secondary button.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { level: 1, name: "Page tree" })).toBeInTheDocument();
        await expect(canvas.getByRole("button", { name: "New page" })).toBeInTheDocument();
    },
};

/**
 * A primary and one secondary action: two buttons.
 */
export const WithSecondaryAction: Story = {
    args: {
        title: "Job ads",
        eyebrow: "Austria · German",
        subtitle: "12 open · 3 drafts",
        primaryAction: { label: "New job ad", icon: <Icon name="plus" />, onClick: fn() },
        secondaryActions: [{ label: "Export", icon: <Icon name="download" />, onClick: fn() }],
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Export" })).toBeInTheDocument();
        await expect(canvas.getByRole("button", { name: "New job ad" })).toBeInTheDocument();
    },
};

/**
 * With more than one secondary action, the secondary button opens them as a menu, so the header still shows two buttons.
 */
export const WithMoreActions: Story = {
    args: {
        title: "Job ads",
        eyebrow: "Austria · German",
        subtitle: "12 open · 3 drafts",
        primaryAction: { label: "New job ad", icon: <Icon name="plus" />, onClick: fn() },
        secondaryActions: [
            { label: "Export", icon: <Icon name="download" />, onClick: fn() },
            { label: "Import …", icon: <Icon name="cloud-upload" />, onClick: fn() },
            { label: "Archive all closed", icon: <Icon name="archive" />, onClick: fn(), separatorBefore: true },
        ],
    },
    play: async ({ args, canvas }) => {
        await expect(canvas.getAllByRole("button")).toHaveLength(2);
        await userEvent.click(canvas.getByRole("button", { name: "More" }));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Export" }));
        await waitFor(() => expect(args.secondaryActions?.[0].onClick).toHaveBeenCalled());
    },
};

/**
 * Edit pages and subpages lead back at the start of the label line, above the title, e.g. to the list the edited item belongs to.
 * They show the item's status, and keep the save state and Save at the end. Back and the breadcrumbs lead to the same place.
 */
export const WithBack: Story = {
    args: {
        title: "Open positions",
        eyebrow: "Page · Austria · German",
        status: <StatusIndicator status="published" />,
        subtitle: "/careers",
        back: { label: "Back to the page tree", href: "#page-tree", onClick: fn() },
        actionStatus: <SaveState state="dirty" />,
        secondaryActions: [
            { label: "Duplicate", icon: <Icon name="copy" />, onClick: fn() },
            { label: "Unpublish", icon: <Icon name="eye-off" />, onClick: fn() },
            { label: "Delete …", icon: <Icon name="trash" />, color: "error", onClick: fn(), separatorBefore: true },
        ],
        primaryAction: { label: "Save", icon: <Icon name="check" />, onClick: fn(), keyboardShortcut: "mod+s" },
    },
    play: async ({ args, canvas }) => {
        const back = canvas.getByRole("link", { name: "Back to the page tree" });
        await expect(back.compareDocumentPosition(canvas.getByRole("heading", { level: 1, name: "Open positions" }))).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        await userEvent.click(back);
        await waitFor(() => expect(args.back?.onClick).toHaveBeenCalled());
    },
};

/**
 * `onTitleChange` makes the title editable in place, e.g. the name of a file. It keeps the title's size and position.
 */
export const EditableTitle: Story = {
    args: {
        title: "team-offsite-2026.jpg",
        eyebrow: "Assets · Photos · Global",
        status: <StatusIndicator status="warning">Alt text missing</StatusIndicator>,
        subtitle: "4000 × 2667, 2.4 MB · 3 usages",
        back: { label: "Back to the assets", href: "#assets" },
        actionStatus: <SaveState state="saved" />,
        secondaryActions: [
            { label: "Download", icon: <Icon name="download" />, onClick: fn() },
            { label: "Replace file …", icon: <Icon name="swap" />, onClick: fn() },
            { label: "Archive", icon: <Icon name="archive" />, onClick: fn(), separatorBefore: true },
        ],
        primaryAction: { label: "Save", icon: <Icon name="check" />, onClick: fn() },
    },
    render: function Render(args) {
        const [title, setTitle] = useState(args.title);
        return <PageHeader {...args} title={title} onTitleChange={setTitle} />;
    },
    play: async ({ canvas }) => {
        const input = canvas.getByRole("textbox", { name: "Title" });
        await userEvent.clear(input);
        await userEvent.type(input, "offsite.jpg");
        await expect(input).toHaveValue("offsite.jpg");
        await expect(canvas.getByRole("heading", { level: 1 })).toContainElement(input);
    },
};

/**
 * Breadcrumbs in the label line, for pages deeper in a hierarchy.
 */
export const WithBreadcrumbs: Story = {
    args: {
        title: "Teaser 2",
        eyebrow: undefined,
        subtitle: undefined,
        primaryAction: undefined,
        breadcrumbs: (
            <Breadcrumbs
                variant="label"
                items={[{ label: "Page", href: "#page" }, { label: "Teaser grid", href: "#teaser-grid" }, { label: "Teaser 2" }]}
            />
        ),
    },
};

/**
 * Only the title, e.g. on the overview.
 */
export const TitleOnly: Story = {
    args: { eyebrow: undefined, subtitle: undefined, primaryAction: undefined },
};

/**
 * In a narrow column, the actions wrap below the title.
 */
export const Narrow: Story = {
    args: WithMoreActions.args,
    decorators: [
        (Story) => (
            <div className={styles.narrow}>
                <Story />
            </div>
        ),
    ],
};

/**
 * In windows narrower than 768 px, e.g. on a phone, the header takes less height: a smaller title, no eyebrow, and the actions next
 * to the title, where buttons with an icon show only the icon. Open it in the workspace with a phone viewport to see it.
 */
export const NarrowWindow: Story = {
    args: WithMoreActions.args,
};

/**
 * `variant="compact"` for editors, where the preview and the fields need the room: a smaller title, with the actions next to it.
 */
export const Compact: Story = {
    args: {
        ...WithBack.args,
        variant: "compact",
        actionStatus: <SaveState state="saved" />,
    },
};
