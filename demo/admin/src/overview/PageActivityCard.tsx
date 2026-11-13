import type { QueryResult } from "@apollo/client";
import { Card, Icon, Link, MiniChart, Skeleton, StatTile } from "@dextinity/ui";
import { differenceInCalendarDays, startOfDay, subDays } from "date-fns";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { LoadError } from "./LoadError";
import type { GQLOverviewPageActivityQuery, GQLOverviewPageActivityQueryVariables } from "./OverviewPage.gql.generated";
import styles from "./OverviewPage.module.css";

const periodInDays = 30;

/**
 * The query only loads the latest pages, so when the oldest loaded page still falls into the period, more pages may have been edited.
 */
export function countPagesEditedSince(data: GQLOverviewPageActivityQuery, since: Date) {
    const { nodes, totalCount } = data.paginatedPageTreeNodes;
    const count = nodes.filter((node) => new Date(node.updatedAt) >= since).length;
    const oldestLoadedNode = nodes.at(-1);
    const isLowerBound = nodes.length < totalCount && oldestLoadedNode !== undefined && new Date(oldestLoadedNode.updatedAt) >= since;
    return { count, isLowerBound };
}

interface PageActivityCardProps {
    query: QueryResult<GQLOverviewPageActivityQuery, GQLOverviewPageActivityQueryVariables>;
    now: Date;
    pageTreeUrl: string;
}

export function PageActivityCard({ query, now, pageTreeUrl }: PageActivityCardProps) {
    const intl = useIntl();
    const nodes = query.data?.paginatedPageTreeNodes.nodes ?? [];

    const pagesPerDay = new Array<number>(periodInDays).fill(0);
    for (const node of nodes) {
        const daysAgo = differenceInCalendarDays(now, new Date(node.updatedAt));
        if (daysAgo >= 0 && daysAgo < periodInDays) {
            pagesPerDay[periodInDays - 1 - daysAgo] += 1;
        }
    }
    const editedPages = pagesPerDay.reduce((sum, count) => sum + count, 0);
    const isLowerBound = query.data !== undefined && countPagesEditedSince(query.data, subDays(startOfDay(now), periodInDays - 1)).isLowerBound;

    return (
        <Card
            title={intl.formatMessage({ id: "overview.pageActivity.title", defaultMessage: "Edited pages" })}
            icon={<Icon name="history" />}
            meta={intl.formatMessage({ id: "overview.pageActivity.period", defaultMessage: "{days} days" }, { days: periodInDays })}
            link={
                <Link render={<RouterLink to={pageTreeUrl} />} endIcon={<Icon name="arrow-right" />}>
                    <FormattedMessage id="overview.pageActivity.pageTree" defaultMessage="Page tree" />
                </Link>
            }
        >
            {query.loading ? (
                <Skeleton variant="tile" />
            ) : query.error ? (
                <LoadError onRetry={() => query.refetch()} />
            ) : (
                <div className={styles.activity}>
                    <StatTile
                        value={
                            isLowerBound
                                ? intl.formatMessage(
                                      { id: "overview.pageActivity.editedPagesLowerBound", defaultMessage: "{count}+" },
                                      { count: intl.formatNumber(editedPages) },
                                  )
                                : intl.formatNumber(editedPages)
                        }
                        label={intl.formatMessage({ id: "overview.pageActivity.editedPages", defaultMessage: "Pages edited" })}
                        context={intl.formatMessage({
                            id: "overview.pageActivity.context",
                            defaultMessage: "Each page counts once, on the day of its latest change",
                        })}
                    />
                    <MiniChart
                        data={pagesPerDay}
                        aria-label={intl.formatMessage(
                            {
                                id: "overview.pageActivity.chartLabel",
                                defaultMessage: "{count, plural, one {# page} other {# pages}} last edited in the past {days} days",
                            },
                            { count: editedPages, days: periodInDays },
                        )}
                        startLabel={intl.formatMessage(
                            { id: "overview.pageActivity.start", defaultMessage: "{days} days ago" },
                            { days: periodInDays },
                        )}
                        endLabel={intl.formatMessage({ id: "overview.pageActivity.end", defaultMessage: "Today" })}
                    />
                </div>
            )}
        </Card>
    );
}
