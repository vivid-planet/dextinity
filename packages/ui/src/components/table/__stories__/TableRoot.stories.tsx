import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Link } from "../../link/Link";
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

const manyJobAds = Array.from({ length: 24 }, (_, index) => ({ ...jobAds[index % jobAds.length], id: String(index + 1) }));

const manyJobAdsContent = (
    <>
        <TableHeader>
            <TableHeaderCell columnId="title">Title</TableHeaderCell>
            <TableHeaderCell columnId="location">Location</TableHeaderCell>
            <TableHeaderCell columnId="applicants">Applicants</TableHeaderCell>
            <TableHeaderCell columnId="status">Status</TableHeaderCell>
        </TableHeader>
        <TableBody>
            {manyJobAds.map((job) => (
                <TableRow key={job.id}>
                    <TableCell columnId="title" className={styles.title}>
                        <Link href={`#job-ad-${job.id}`}>{job.title}</Link>
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
);

async function scrollWindowTo(top: number) {
    window.scrollTo({ top, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

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
        toolbar: { control: false },
        stickyHeader: { control: "boolean" },
        stickyToolbar: { control: "boolean" },
        labels: { control: false },
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
 * When the columns don't fit, the table scrolls horizontally and no column gets narrower than its `minWidth`. The scrolling area can
 * then be focused and scrolled with the arrow keys, also when the table holds nothing else to focus. The header still stays in view
 * while the page scrolls.
 */
export const HorizontalScroll: Story = {
    tags: ["forced-colors"],
    args: { columns: columns.map((column) => ({ ...column, minWidth: 200 })), children: manyJobAdsContent },
    render: (args) => (
        <Panel className={styles.narrow}>
            <TableRoot {...args} />
        </Panel>
    ),
    play: async ({ canvas, canvasElement, step }) => {
        const region = await canvas.findByRole("region", { name: "Job ads" });
        await expect(canvasElement.querySelector(".dextinityTableRoot")).toHaveAttribute("data-overflowing");

        await step("Each column is at least as wide as its minimum", async () => {
            await expect(canvas.getByRole("columnheader", { name: "Location" }).getBoundingClientRect().width).toBeGreaterThanOrEqual(199.5);
        });

        await step("The scrolling area takes keyboard focus after the skip link", async () => {
            await userEvent.tab();
            await expect(canvas.getByRole("link", { name: "Skip table Job ads" })).toHaveFocus();
            await userEvent.tab();
            await expect(region).toHaveFocus();
            if (window.matchMedia("(forced-colors: active)").matches && region.parentElement != null) {
                await expect(getComputedStyle(region.parentElement, "::after").outlineStyle).toBe("solid");
            }
        });

        try {
            await step("The header still follows the page scroll", async () => {
                const header = canvas.getByRole("columnheader", { name: "Title" });
                await scrollWindowTo(header.getBoundingClientRect().top + window.scrollY + 600);
                await waitFor(() => expect(Math.abs(header.getBoundingClientRect().top)).toBeLessThan(1));
            });
        } finally {
            await scrollWindowTo(0);
        }
    },
};

/**
 * The header row stays at the top of the window while the page scrolls past the table, and a row that gets focus scrolls into view
 * below it. Set `--dextinity-table-sticky-offset` to the height of the app's own sticky bars to keep it below them. `stickyHeader`
 * turns it off.
 */
export const StickyHeader: Story = {
    tags: ["forced-colors"],
    args: { children: manyJobAdsContent },
    play: async ({ canvas, step }) => {
        const header = canvas.getByRole("columnheader", { name: "Title" });
        const links = canvas.getAllByRole("link");
        try {
            await step("The header stays at the top while the page scrolls", async () => {
                // A filter other than `none` would make the header the containing block of fixed elements inside it
                await expect(getComputedStyle(header).backdropFilter).toBe("none");
                await scrollWindowTo(header.getBoundingClientRect().top + window.scrollY + 600);
                await waitFor(() => expect(Math.abs(header.getBoundingClientRect().top)).toBeLessThan(1));
                await waitFor(() => expect(getComputedStyle(header).backgroundColor).not.toBe("rgba(0, 0, 0, 0)"));
                await expect(getComputedStyle(header).backdropFilter).not.toBe("none");
            });

            await step("A row focused from the keyboard scrolls out from under the header", async () => {
                const target = links[16];
                await scrollWindowTo(window.scrollY + target.getBoundingClientRect().top - 8);
                links[17].focus({ preventScroll: true });
                await userEvent.tab({ shift: true });
                await expect(target).toHaveFocus();
                await waitFor(() => expect(target.getBoundingClientRect().top).toBeGreaterThan(header.getBoundingClientRect().bottom - 1));
            });
        } finally {
            await scrollWindowTo(0);
        }
    },
};

/**
 * In a scroll container, e.g. the body of a `Drawer`, the header row stays at the top of the container while it scrolls.
 */
export const ScrollContainer: Story = {
    args: { children: manyJobAdsContent },
    render: (args) => (
        <Panel title="Job ads" slotProps={{ body: { className: styles.scrollContainer } }}>
            <TableRoot {...args} />
        </Panel>
    ),
    play: async ({ canvas, canvasElement }) => {
        const container = canvasElement.querySelector(`.${styles.scrollContainer}`) as HTMLElement;
        const header = canvas.getByRole("columnheader", { name: "Title" });
        const containerTop = container.getBoundingClientRect().top + container.clientTop + parseFloat(getComputedStyle(container).paddingTop);
        await expect(containerTop).toBeGreaterThan(8);

        // The table's top is above the container's top but still below the window's top
        container.scrollTop += canvas.getByRole("table").getBoundingClientRect().top - containerTop / 2;
        await waitFor(() => expect(Math.abs(header.getBoundingClientRect().top - containerTop)).toBeLessThan(1));
        // Held in place, so the header blurs the rows behind it
        await waitFor(() => expect(getComputedStyle(header).backdropFilter).not.toBe("none"));
    },
};

/**
 * `stickyToolbar` keeps the `toolbar` at the top of the window as well, with the header below it.
 */
export const StickyToolbar: Story = {
    args: { children: manyJobAdsContent, toolbar: <span>24 job ads</span>, stickyToolbar: true },
    play: async ({ canvas, canvasElement, step }) => {
        const toolbar = canvasElement.querySelector(".dextinityTableRoot__toolbar") as HTMLElement;
        const header = canvas.getByRole("columnheader", { name: "Title" });
        try {
            await step("The toolbar stays at the top, with the header below it", async () => {
                await scrollWindowTo(header.getBoundingClientRect().top + window.scrollY + 600);
                await waitFor(() => expect(Math.abs(toolbar.getBoundingClientRect().top)).toBeLessThan(1));
                await waitFor(() => expect(Math.abs(header.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom)).toBeLessThan(1));
            });

            await step("At the end of the table, the header slides under the toolbar", async () => {
                // Leaves room below the table, so its end can scroll up to the toolbar
                canvasElement.style.paddingBlockEnd = "100vh";
                const toolbarRect = toolbar.getBoundingClientRect();
                const tableBottom = canvas.getByRole("table").getBoundingClientRect().bottom;
                await scrollWindowTo(window.scrollY + tableBottom - toolbarRect.bottom - header.getBoundingClientRect().height / 2);
                await waitFor(() => expect(header.getBoundingClientRect().top).toBeLessThan(toolbarRect.bottom - 1));
                await expect(toolbar.contains(document.elementFromPoint(toolbarRect.left + 4, toolbarRect.bottom - 2))).toBe(true);
            });
        } finally {
            canvasElement.style.removeProperty("padding-block-end");
            await scrollWindowTo(0);
        }
    },
};

/**
 * A link before the table, shown while it has focus, moves focus past the table, e.g. to the button below it, so keyboard users
 * don't have to tab through every row. It is named after the table, so each table on a page has its own.
 */
export const SkipLink: Story = {
    tags: ["forced-colors"],
    args: { children: manyJobAdsContent },
    render: (args) => (
        <Panel>
            <TableRoot {...args} />
            <Button variant="outlined" color="secondary" size="small" className={styles.loadMore}>
                Load more
            </Button>
        </Panel>
    ),
    play: async ({ canvas, step }) => {
        const skipLink = canvas.getByRole("link", { name: "Skip table Job ads" });

        await step("The skip link is the first tab stop and shows while it has focus", async () => {
            await userEvent.tab();
            await expect(skipLink).toHaveFocus();
            await expect(skipLink.getBoundingClientRect().width).toBeGreaterThan(1);
            if (window.matchMedia("(forced-colors: active)").matches) {
                await expect(getComputedStyle(skipLink).outlineStyle).toBe("solid");
            }
        });

        await step("Enter moves focus past the table, so the next tab stop follows the table", async () => {
            await userEvent.keyboard("{Enter}");
            await expect(canvas.getByText("End of table Job ads")).toHaveFocus();
            await userEvent.tab();
            await expect(canvas.getByRole("button", { name: "Load more" })).toHaveFocus();
        });
    },
};
