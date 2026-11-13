import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect } from "storybook/test";

import { PageTypeShell, StructureFrame, StructureRegion } from "../../../storybook/pageTypes/PageTypeShell";
import { PatternLegend, PatternLinks, PatternPage, PatternRules, PatternSection } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Avatar } from "../../avatar/Avatar";
import { Button } from "../../button/Button";
import { Card } from "../../card/Card";
import { EmptyState } from "../../emptyState/EmptyState";
import { Icon } from "../../icon/Icon";
import { Link } from "../../link/Link";
import { MiniChart } from "../../miniChart/MiniChart";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { OverviewLayout } from "../OverviewLayout";
import overviewLayoutTokens from "../OverviewLayout.tokens.scss?raw";
import styles from "./OverviewLayout.stories.module.scss";

const recentlyEdited = [
    { title: "Open positions", path: "/careers/open-positions", editor: "Anna Klein", time: "12 min ago" },
    { title: "Senior UX Designer", path: "/careers/senior-ux-designer", editor: "Max Mustermann", time: "1 h ago" },
    { title: "About us", path: "/about-us", editor: "Lena Berger", time: "Yesterday" },
];

const published = [3, 5, 2, 0, 4, 6, 1, 0, 0, 2, 7, 3, 4, 1, 0, 5, 2, 8, 3, 1, 0, 0, 4, 6, 2, 3, 5, 1, 4, 6];

const warnings = [
    { title: "Broken link on “Apply now”", context: "Senior UX Designer · Page", status: "critical", label: "Critical" },
    { title: "Image without alt text", context: "About us · Image", status: "warning", label: "Warning" },
    { title: "Job ad expires in 3 days", context: "QA Engineer · Job ad", status: "info", label: "Notice" },
] as const;

function Clock() {
    return (
        <>
            <div className={styles.clock}>09:41</div>
            <div className={styles.clockLabel}>Friday, 6 November · Vienna</div>
        </>
    );
}

function Row({ title, subtitle, end, href = "#" }: { title: string; subtitle: string; end: ReactNode; href?: string }) {
    return (
        <a className={styles.row} href={href}>
            <div>
                <div className={styles.rowTitle}>{title}</div>
                <div className={styles.rowSubtitle}>{subtitle}</div>
            </div>
            <div className={styles.rowEnd}>{end}</div>
            <Icon name="arrow" size="small" className={styles.rowGo} />
        </a>
    );
}

function OverviewCards() {
    return (
        <>
            <Card
                title="Recently edited"
                icon={<Icon name="clock" />}
                link={
                    <Link href="#page-tree" endIcon={<Icon name="arrow" />}>
                        Page tree
                    </Link>
                }
            >
                {recentlyEdited.map((page) => (
                    <Row
                        key={page.path}
                        title={page.title}
                        subtitle={page.path}
                        end={
                            <>
                                <Avatar name={page.editor} size="small" />
                                {page.time}
                            </>
                        }
                    />
                ))}
            </Card>
            <Card title="Published" icon={<Icon name="bolt" />} meta="30 days">
                <div className={styles.published}>
                    <div className={styles.publishedHead}>
                        <div>
                            <div className={styles.publishedLabel}>Latest</div>
                            <StatusIndicator status="published">Open positions</StatusIndicator>
                            <div className={styles.publishedMeta}>12 min ago by Anna Klein</div>
                        </div>
                        <div className={styles.publishedTotal}>
                            <span>87</span>
                            <div className={styles.publishedLabel}>changes live</div>
                        </div>
                    </div>
                    <MiniChart data={published} aria-label="Published changes per day" highlightLast startLabel="30 days ago" endLabel="Today" />
                </div>
            </Card>
            <Card
                title="Warnings"
                icon={<Icon name="warn-tri" />}
                meta="3 open"
                link={
                    <Link href="#warnings" endIcon={<Icon name="arrow" />}>
                        All
                    </Link>
                }
            >
                {warnings.map((warning) => (
                    <Row
                        key={warning.title}
                        title={warning.title}
                        subtitle={warning.context}
                        end={<StatusIndicator status={warning.status}>{warning.label}</StatusIndicator>}
                    />
                ))}
            </Card>
            <Card title="New form submissions" icon={<Icon name="form" />}>
                <EmptyState
                    icon={<Icon name="alert" />}
                    title="Couldn't load"
                    description="The server didn't answer in time. Your content is not affected."
                    actions={
                        <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="refresh" />}>
                            Load again
                        </Button>
                    }
                />
            </Card>
        </>
    );
}

const meta = {
    component: OverviewLayout,
    title: "Page types/Overview",
    decorators: [themeDecorator],
    parameters: {
        tokens: overviewLayoutTokens,
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "The entry point of an app: what happened, and where to go on. A greeting with a one-sentence summary and a clock, then up to six cards — recently edited, published, warnings, new submissions — each leading to its full view.",
            },
            story: { inline: false, height: "960px" },
        },
    },
    args: {
        title: "Good morning, Max",
        children: null,
    },
    argTypes: {
        title: { control: "text" },
        eyebrow: { control: "text" },
        back: { control: false },
        summary: { control: false },
        aside: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof OverviewLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The overview of the career portal inside the app frame.
 *
 * **Rules**
 *
 * - Do: summary first, details in cards; every card leads on.
 * - Don't: show metrics without an action; use more than six cards.
 */
export const Default: Story = {
    render: (args) => (
        <PageTypeShell activeId="dashboard">
            <OverviewLayout
                {...args}
                eyebrow={args.eyebrow ?? "Career portal · Overview"}
                summary={
                    args.summary ?? (
                        <>
                            Since yesterday, <a href="#page-tree">4 pages were edited</a> and <a href="#job-ads">2 job ads published</a>.
                        </>
                    )
                }
                aside={args.aside ?? <Clock />}
            >
                <OverviewCards />
            </OverviewLayout>
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { level: 1, name: "Good morning, Max" })).toBeVisible();
        await expect(canvas.getByRole("region", { name: "Warnings" })).toBeVisible();
    },
};

/**
 * `back` leads to the page above, e.g. from the overview of one site to the list of all sites.
 */
export const WithBack: Story = {
    render: (args) => (
        <PageTypeShell activeId="dashboard">
            <OverviewLayout {...args} eyebrow="Overview" back={{ label: "All sites", href: "#sites" }}>
                <OverviewCards />
            </OverviewLayout>
        </PageTypeShell>
    ),
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("link", { name: "All sites" })).toBeVisible();
    },
};

/**
 * The regions of the overview and the draft's rules.
 */
export const Structure: Story = {
    parameters: { layout: "padded", docs: { story: { inline: true } } },
    render: () => (
        <PatternPage>
            <PatternSection title="Structure">
                <div className={styles.structure}>
                    <StructureFrame>
                        <OverviewLayout
                            className={styles.structureLayout}
                            title={<StructureRegion number={1} label="Greeting · summary · clock" variant="dashed" />}
                            slotProps={{ hero: { className: styles.structureHero }, title: { className: styles.structureTitle } }}
                        >
                            <StructureRegion number={2} label="Recently edited" className={styles.structureCard} />
                            <StructureRegion number={3} label="Published · 30 days" className={styles.structureCard} />
                            <StructureRegion number={4} label="Warnings" variant="warning" className={styles.structureCard} />
                            <StructureRegion number={5} label="New submissions" className={styles.structureCard} />
                        </OverviewLayout>
                    </StructureFrame>
                    <PatternLegend
                        items={[
                            { title: "Greeting", description: "One sentence on what happened since yesterday, with links. No warnings in the text." },
                            { title: "Recently edited", description: "Continue working with one click." },
                            { title: "Published", description: "History and the latest changes that went live." },
                            { title: "Warnings", description: "Only real problems, each with a way to solve it." },
                            { title: "Submissions", description: "New form entries." },
                        ]}
                    />
                </div>
            </PatternSection>
            <PatternLinks
                title="Components used"
                links={[
                    { label: "Panels, cards & metrics", docsId: "building-blocks-panels-cards-metrics-card--docs" },
                    { label: "Status, tags & badges", docsId: "building-blocks-status-tags-badges-statusindicator--docs" },
                    { label: "App frame", docsId: "shell-app-frame-appshell--docs" },
                ]}
            />
            <PatternRules
                dos={["Summary first, details in cards.", "Every card leads on."]}
                donts={["Metrics without an action.", "More than six cards."]}
            />
        </PatternPage>
    ),
};
