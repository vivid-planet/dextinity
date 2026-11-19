import type { ReactNode } from "react";

import { Avatar } from "../../../components/avatar/Avatar";
import { Button } from "../../../components/button/Button";
import { Card } from "../../../components/card/Card";
import { Icon } from "../../../components/icon/Icon";
import { Link } from "../../../components/link/Link";
import { MiniChart } from "../../../components/miniChart/MiniChart";
import { OverviewLayout } from "../../../components/overviewLayout/OverviewLayout";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { newsArticles } from "./cmsData";
import styles from "./cmsPrototype.module.scss";

const recentlyEdited = [
    { title: "Home", subtitle: "Page · /", href: "#page-tree/home", editor: "Anna Klein", time: "12 min ago" },
    { title: newsArticles[0].title, subtitle: "News · Product", href: `#news/${newsArticles[0].id}`, editor: "Max Mustermann", time: "1 h ago" },
    { title: "About us", subtitle: "Page · /about-us", href: "#page-tree/about", editor: "Lena Berger", time: "Yesterday" },
    {
        title: "Content management",
        subtitle: "Page · /products/content-management",
        href: "#page-tree/cms",
        editor: "Anna Klein",
        time: "2 days ago",
    },
];

const scheduled = newsArticles.filter((article) => article.status === "unpublished").slice(0, 3);

const published = [3, 5, 2, 0, 4, 6, 1, 0, 0, 2, 7, 3, 4, 1, 0, 5, 2, 8, 3, 1, 0, 0, 4, 6, 2, 3, 5, 1, 4, 6];

const warnings = [
    { title: "Image without alt text", context: "office-vienna.jpg · Asset", href: "#assets", status: "warning", label: "Warning" },
    { title: "Broken link to “Analytics”", context: "Products · Page", href: "#page-tree/products", status: "critical", label: "Critical" },
    { title: "Page not reviewed for 12 months", context: "Locations · Page", href: "#page-tree/locations", status: "info", label: "Notice" },
] as const;

function Row({ title, subtitle, end, href }: { title: string; subtitle: string; end: ReactNode; href: string }) {
    return (
        <a className={styles.row} href={href}>
            <div className={styles.rowText}>
                <div className={styles.rowTitle}>{title}</div>
                <div className={styles.rowSubtitle}>{subtitle}</div>
            </div>
            <div className={styles.rowEnd}>{end}</div>
            <Icon name="arrow-right" size="small" className={styles.rowGo} />
        </a>
    );
}

function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function CmsDashboard() {
    return (
        <PageTypeShell currentId="dashboard">
            <OverviewLayout
                eyebrow="Website · Overview"
                title="Good morning, Max"
                summary={
                    <>
                        Since yesterday, <a href="#page-tree">4 pages were edited</a> and <a href="#news">2 articles published</a>.
                    </>
                }
                aside={
                    <div className={styles.quickActions}>
                        <Button startIcon={<Icon name="plus" />} href="#news/new">
                            Write an article
                        </Button>
                        <Button variant="outlined" color="secondary" startIcon={<Icon name="cloud-upload" />} href="#assets">
                            Upload files
                        </Button>
                    </div>
                }
            >
                <Card
                    title="Recently edited"
                    icon={<Icon name="clock" />}
                    link={
                        <Link href="#page-tree" endIcon={<Icon name="arrow-right" />}>
                            Page tree
                        </Link>
                    }
                >
                    {recentlyEdited.map((item) => (
                        <Row
                            key={item.href}
                            title={item.title}
                            subtitle={item.subtitle}
                            href={item.href}
                            end={
                                <>
                                    <Avatar name={item.editor} size="small" />
                                    {item.time}
                                </>
                            }
                        />
                    ))}
                </Card>
                <Card
                    title="Unpublished news"
                    icon={<Icon name="news" />}
                    meta={`${scheduled.length} drafts`}
                    link={
                        <Link href="#news" endIcon={<Icon name="arrow-right" />}>
                            News
                        </Link>
                    }
                >
                    {scheduled.map((article) => (
                        <Row
                            key={article.id}
                            title={article.title}
                            subtitle={`${article.category} · ${article.author}`}
                            href={`#news/${article.id}`}
                            end={formatDate(article.date)}
                        />
                    ))}
                </Card>
                <Card title="Published" icon={<Icon name="bolt" />} meta="30 days">
                    <div className={styles.published}>
                        <div className={styles.publishedHead}>
                            <div>
                                <div className={styles.label}>Latest</div>
                                <StatusIndicator status="published">Home</StatusIndicator>
                            </div>
                            <div className={styles.publishedTotal}>
                                <span>87</span>
                                <div className={styles.label}>changes live</div>
                            </div>
                        </div>
                        <MiniChart data={published} aria-label="Published changes per day" highlightLast startLabel="30 days ago" endLabel="Today" />
                    </div>
                </Card>
                <Card title="Warnings" icon={<Icon name="warning-triangle" />} meta={`${warnings.length} open`}>
                    {warnings.map((warning) => (
                        <Row
                            key={warning.title}
                            title={warning.title}
                            subtitle={warning.context}
                            href={warning.href}
                            end={<StatusIndicator status={warning.status}>{warning.label}</StatusIndicator>}
                        />
                    ))}
                </Card>
            </OverviewLayout>
        </PageTypeShell>
    );
}
