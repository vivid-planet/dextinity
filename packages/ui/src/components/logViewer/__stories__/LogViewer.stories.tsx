import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import { LogViewer, type LogViewerLineTone, type LogViewerProps } from "../LogViewer";
import logViewerTokens from "../LogViewer.tokens.scss?raw";
import styles from "./LogViewer.stories.module.scss";

const jobLog = [
    "2026-11-06T02:00:00.112Z INFO  Starting job page-tree-index (attempt 1 of 3)",
    "2026-11-06T02:00:00.418Z INFO  Connected to database dextinity@postgres:5432",
    "2026-11-06T02:00:01.027Z INFO  Indexing scope { domain: main, language: de } – 1,204 pages",
    "2026-11-06T02:00:04.553Z WARN  Page /de/careers/old-position has no published document, skipping",
    "2026-11-06T02:00:06.870Z INFO  Indexing scope { domain: main, language: en } – 988 pages",
    "2026-11-06T02:00:09.301Z ERROR Failed to render block 6f1c2e (TeaserBlock): Cannot read properties of undefined (reading 'image')",
    "    at renderTeaser (/app/src/blocks/TeaserBlock.ts:42:31)",
    "    at async Promise.all (index 3)",
    "2026-11-06T02:00:11.954Z INFO  Indexed 2,191 of 2,192 pages in 11.8 s",
    "2026-11-06T02:00:12.002Z INFO  Job finished with 1 error",
].join("\n");

function toneOfLine(line: string): LogViewerLineTone | undefined {
    if (/\bERROR\b/.test(line)) {
        return "error";
    }
    if (/\bWARN\b/.test(line)) {
        return "warning";
    }
    return undefined;
}

/** Simulates a running job: a new line every 600 ms, then it stops. */
function RunningLog(props: LogViewerProps) {
    const [content, setContent] = useState(props.content);
    const [running, setRunning] = useState(true);
    useEffect(() => {
        let count = 0;
        const timer = setInterval(() => {
            count += 1;
            setContent((current) => `${current}\n2026-11-06T02:00:${String(12 + count).padStart(2, "0")}.000Z INFO  Processed batch ${count} of 20`);
            if (count === 20) {
                clearInterval(timer);
                setRunning(false);
            }
        }, 600);
        return () => clearInterval(timer);
    }, []);
    return <LogViewer {...props} content={content} loading={running} />;
}

const meta = {
    component: LogViewer,
    title: "Building blocks/Panels, cards & metrics/LogViewer",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.container}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: logViewerTokens },
    args: { content: jobLog, title: "page-tree-index · Run #482", getLineTone: toneOfLine, onCopy: fn() },
    argTypes: {
        lineNumbers: { control: "boolean" },
        wrap: { control: "boolean" },
        follow: { control: "boolean" },
        loading: { control: "boolean" },
        title: { control: "text" },
        actions: { control: false },
        getLineTone: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
        style: { control: false },
    },
} satisfies Meta<typeof LogViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Highlight errors and warnings with `getLineTone`, so they stand out in a long log.
 *
 * **Rules**
 * - Show the log as it is; don't reformat or shorten lines.
 * - Copying copies the text only, without line numbers.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const log = canvas.getByRole("log", { name: "page-tree-index · Run #482" });
        await expect(within(log).getAllByRole("listitem")).toHaveLength(10);

        log.focus();
        await expect(log).toHaveFocus();
    },
};

/**
 * Wraps long lines instead of scrolling sideways.
 */
export const Wrap: Story = {
    args: { wrap: true },
};

/**
 * Without line numbers, e.g. for short output.
 */
export const WithoutLineNumbers: Story = {
    args: { lineNumbers: false },
};

/**
 * Keeps the latest lines in view while the job runs. Scroll up to pause; the button jumps back.
 */
export const Follow: Story = {
    args: { follow: true, style: { "--dextinity-log-viewer-max-height": "200px" } as CSSProperties },
    render: (args) => <RunningLog {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const log = canvas.getByRole("log");
        await waitFor(() => expect(within(log).getAllByRole("listitem").length).toBeGreaterThan(12), { timeout: 4000 });
        await expect(log.scrollHeight).toBeGreaterThan(log.clientHeight);
        await expect(log.scrollTop + log.clientHeight).toBeGreaterThanOrEqual(log.scrollHeight - 8);

        log.scrollTop = 0;
        const jump = await canvas.findByRole("button", { name: "Jump to latest" });
        await userEvent.click(jump);
        await expect(log.scrollTop + log.clientHeight).toBeGreaterThanOrEqual(log.scrollHeight - 8);
    },
};

/**
 * More actions sit before the copy button, e.g. a download.
 */
export const Actions: Story = {
    args: {
        actions: (
            <IconButton variant="text" color="secondary" size="small" aria-label="Download log" onClick={fn()}>
                <Icon name="download" />
            </IconButton>
        ),
    },
};

/**
 * While there is no output yet.
 */
export const Empty: Story = {
    args: { content: "" },
};
