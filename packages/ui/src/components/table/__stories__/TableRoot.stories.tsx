import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Panel } from "../../panel/Panel";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { TableBody } from "../TableBody";
import { TableCell } from "../TableCell";
import type { TableLayoutColumn } from "../tableContext";
import { TableHeader } from "../TableHeader";
import { TableHeaderCell } from "../TableHeaderCell";
import { TableRoot } from "../TableRoot";
import { TableRow } from "../TableRow";
import styles from "./TableRoot.stories.module.scss";

const columns: TableLayoutColumn[] = [
    { id: "title", minWidth: 200 },
    { id: "location", width: 140 },
    { id: "applicants", width: 120, align: "end" },
    { id: "status", width: 160 },
];

const jobAds = [
    { id: "1", title: "Senior UX Designer", location: "Vienna", applicants: 12, status: "published" },
    { id: "2", title: "Frontend Developer", location: "Graz", applicants: 31, status: "published" },
    { id: "3", title: "Product Owner CMS", location: "Linz", applicants: 4, status: "unpublished" },
    { id: "4", title: "DevOps Engineer", location: "Remote", applicants: 18, status: "archived" },
] as const;

const meta = {
    component: TableRoot,
    title: "Building blocks/Tables & paging/TableRoot",
    decorators: [themeDecorator],
    args: {
        "aria-label": "Job ads",
        columns,
        children: (
            <>
                <TableHeader>
                    <TableHeaderCell columnId="title">Title</TableHeaderCell>
                    <TableHeaderCell columnId="location">Location</TableHeaderCell>
                    <TableHeaderCell columnId="applicants">Applicants</TableHeaderCell>
                    <TableHeaderCell columnId="status">Status</TableHeaderCell>
                </TableHeader>
                <TableBody>
                    {jobAds.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell columnId="title" className={styles.title}>
                                {job.title}
                            </TableCell>
                            <TableCell columnId="location">{job.location}</TableCell>
                            <TableCell columnId="applicants">{job.applicants}</TableCell>
                            <TableCell columnId="status">
                                <StatusIndicator status={job.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </>
        ),
    },
    argTypes: {
        columns: { control: false },
        children: { control: false },
        className: { control: false },
        style: { control: false },
        slotProps: { control: false },
    },
    render: (args) => (
        <Panel>
            <TableRoot {...args} />
        </Panel>
    ),
} satisfies Meta<typeof TableRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Columns with a `width` keep it, the others share the rest of the space. The table has no frame of its own and sits in a `Panel`.
 */
export const Default: Story = {
    tags: ["forced-colors"],
    play: async ({ canvas }) => {
        const header = canvas.getByRole("columnheader", { name: "Title" });
        await expect(canvas.getByRole("table", { name: "Job ads" })).toBeVisible();
        await expect(canvas.getByRole("columnheader", { name: "Applicants" })).toHaveAttribute("data-align", "end");
        if (window.matchMedia("(forced-colors: active)").matches) {
            await expect(getComputedStyle(header).borderBottomStyle).toBe("solid");
        }
    },
};

/**
 * When every column has a `width`, the table is only as wide as its columns. `minWidth` and `maxWidth` limit a column's `width`.
 */
export const FixedColumnWidths: Story = {
    args: {
        columns: [
            { id: "title", width: 240 },
            { id: "location", width: 60, minWidth: 120 },
            { id: "applicants", width: 200, maxWidth: 120, align: "end" },
            { id: "status", width: 160 },
        ],
    },
    play: async ({ canvas }) => {
        const widths = ["Title", "Location", "Applicants", "Status"].map((name) =>
            Math.round(canvas.getByRole("columnheader", { name }).getBoundingClientRect().width),
        );
        await expect(widths).toStrictEqual([240, 120, 120, 160]);
    },
};

/**
 * When the columns don't fit, the table scrolls horizontally and no column gets narrower than its `minWidth`.
 */
export const HorizontalScroll: Story = {
    args: { columns: columns.map((column) => ({ ...column, minWidth: 200 })) },
    render: (args) => (
        <Panel className={styles.narrow}>
            <TableRoot {...args} />
        </Panel>
    ),
    play: async ({ canvas, step }) => {
        await step("Each column is at least as wide as its minimum", async () => {
            await expect(canvas.getByRole("columnheader", { name: "Location" }).getBoundingClientRect().width).toBeGreaterThanOrEqual(199.5);
        });
    },
};
