import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Breadcrumbs } from "../../breadcrumbs/Breadcrumbs";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
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
        actions: <Button startIcon={<Icon name="plus" />}>New page</Button>,
    },
    argTypes: {
        eyebrow: { control: "text" },
        subtitle: { control: "text" },
        actions: { control: false },
        back: { control: false },
        breadcrumbs: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Every page starts the same: context label, display title, numbers, actions.
 *
 * **Rules**
 *
 * - One display title per page.
 * - At most one primary action.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { level: 1, name: "Page tree" })).toBeInTheDocument();
        await expect(canvas.getByRole("button", { name: "New page" })).toBeInTheDocument();
    },
};

/**
 * Edit pages lead back to the list in the label line. The back link and breadcrumbs lead to the same place.
 */
export const WithBack: Story = {
    args: {
        title: "Open positions",
        eyebrow: "Page · Austria · German",
        subtitle: <StatusIndicator status="published" />,
        back: { label: "Page tree", href: "#page-tree", onClick: fn() },
        actions: (
            <>
                <IconButton color="secondary" aria-label="More actions" variant="text">
                    <Icon name="more-horizontal" />
                </IconButton>
                <Button>Publish</Button>
            </>
        ),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("link", { name: "Page tree" }));
        await waitFor(() => expect(args.back?.onClick).toHaveBeenCalled());
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
        actions: undefined,
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
    args: { eyebrow: undefined, subtitle: undefined, actions: undefined },
};

/**
 * In a narrow column, the actions wrap below the title.
 */
export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div className={styles.narrow}>
                <Story />
            </div>
        ),
    ],
};

/**
 * `variant="compact"` for editors, where the preview and the fields need the room: a smaller title, with the actions next to it.
 */
export const Compact: Story = {
    args: {
        ...WithBack.args,
        variant: "compact",
        actions: (
            <>
                <SaveState state="saved" />
                <Button>Publish</Button>
            </>
        ),
    },
};
