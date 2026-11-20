import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "../../../components/icon/Icon";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { themeDecorator } from "../../themeDecorator";
import { EnvironmentIndicatorProposal, EnvironmentLabelOverview } from "./EnvironmentIndicator";

/**
 * What's currently being designed in the workspace. Replace the stories freely; each one shows up in the workspace's story list.
 */
const meta = {
    title: "Workspace/Canvas",
    tags: ["!autodocs", "!manifest"],
    decorators: [themeDecorator],
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Current: Story = {
    render: () => (
        <PageTypeShell currentId="job-ads">
            <PageHeader
                eyebrow="Content · Careers"
                title="Job ads"
                subtitle="Start here: this page is the workspace's canvas"
                primaryAction={{ label: "New job ad", icon: <Icon name="plus" /> }}
            />
        </PageTypeShell>
    ),
};

/**
 * Marking the instance: A, a label in the corner of the navigation's header. Switch the instance in the card.
 */
export const EnvironmentLabelInNavigation: Story = {
    name: "Instance A · Label in navigation",
    render: () => <EnvironmentIndicatorProposal variant="navLabel" />,
};

/**
 * Marking the instance: B, a low banner over the full width above the app.
 */
export const EnvironmentBanner: Story = {
    name: "Instance B · Banner",
    render: () => <EnvironmentIndicatorProposal variant="banner" />,
};

/**
 * Marking the instance: C, a line in the instance's color along the top edge plus the label of A.
 */
export const EnvironmentEdgeAndLabel: Story = {
    name: "Instance C · Edge and label",
    render: () => <EnvironmentIndicatorProposal variant="edge" />,
};

/**
 * The labels of every instance, in the expanded and the collapsed navigation.
 */
export const EnvironmentLabels: Story = {
    name: "Instance · All labels",
    render: () => <EnvironmentLabelOverview />,
};
