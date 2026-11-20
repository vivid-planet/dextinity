import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "../../../components/icon/Icon";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { themeDecorator } from "../../themeDecorator";

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
