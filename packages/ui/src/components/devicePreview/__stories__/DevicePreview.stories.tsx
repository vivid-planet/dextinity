import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import devicePreviewTokens from "../_tokens.scss?raw";
import { DevicePreview, type DevicePreviewProps } from "../DevicePreview";
import styles from "./DevicePreview.stories.module.scss";

function SamplePage() {
    return (
        <div className={styles.site}>
            <header className={styles.siteHeader}>
                <span className={styles.siteLogo}>Example Inc.</span>
                <nav className={styles.siteNav}>
                    <span>Jobs</span>
                    <span>Company</span>
                    <span>Contact</span>
                </nav>
            </header>
            <div className={styles.siteStage} />
            <main className={styles.siteMain}>
                <h1>Open positions</h1>
                <p>Join a team that builds digital products for people who care about craft.</p>
                {["Frontend developer", "Product designer", "Project manager", "Backend developer"].map((job) => (
                    <div key={job} className={styles.siteJob}>
                        <span>{job}</span>
                        <span>Vienna · Full-time</span>
                    </div>
                ))}
            </main>
        </div>
    );
}

/** Keeps the story controlled: switching the device updates the local value. */
function ControlledDevicePreview(props: DevicePreviewProps) {
    const [device, setDevice] = useState(props.device);
    return (
        <div className={styles.container}>
            <DevicePreview
                {...props}
                device={device}
                onDeviceChange={(next) => {
                    props.onDeviceChange(next);
                    setDevice(next);
                }}
            />
        </div>
    );
}

const meta = {
    component: DevicePreview,
    title: "Building blocks/Blocks & preview/DevicePreview",
    decorators: [themeDecorator],
    parameters: { tokens: devicePreviewTokens },
    args: {
        url: "example.com/careers/open-positions",
        device: "desktop",
        onDeviceChange: fn(),
        children: <SamplePage />,
    },
    argTypes: {
        device: { control: "radio", options: ["desktop", "tablet", "mobile"] },
        children: { control: false },
        actions: { control: false },
        deviceWidths: { control: "object" },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledDevicePreview {...args} />,
} satisfies Meta<typeof DevicePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The page is laid out at the device's width and scaled down when the space is narrower.
 *
 * **Rules**
 *
 * - Keep the preview and the block list in sync: a click in the preview selects the block.
 * - Mark hidden blocks in the preview the same way as in the list.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Phone" }));
        await waitFor(() => expect(args.onDeviceChange).toHaveBeenLastCalledWith("mobile"));
        await expect(canvas.getByRole("button", { name: "Phone" })).toHaveAttribute("aria-pressed", "true");
    },
};

export const Tablet: Story = {
    args: { device: "tablet" },
};

export const Mobile: Story = {
    args: { device: "mobile" },
};

/**
 * Further actions go to the end of the toolbar.
 */
export const WithActions: Story = {
    args: {
        actions: (
            <>
                <IconButton size="small" aria-label="Show hidden blocks">
                    <Icon name="eye-off" />
                </IconButton>
                <IconButton size="small" aria-label="Open in new tab">
                    <Icon name="external-link" />
                </IconButton>
            </>
        ),
    },
};

/**
 * An `iframe` filling the frame previews a real page.
 */
export const WithIframe: Story = {
    args: {
        children: (
            <iframe
                className={styles.siteFrame}
                title="Preview"
                srcDoc="<body style='margin:0;font:16px Georgia,serif;background:#fbfaf7'><div style='padding:40px'><h1>Rendered in an iframe</h1><p>The frame lays the page out at the device's width.</p></div></body>"
            />
        ),
    },
};
