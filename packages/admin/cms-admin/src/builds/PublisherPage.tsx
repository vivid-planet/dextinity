import { gql, useQuery } from "@apollo/client";
import { DataGrid, type DataGridColumn, EmptyState, Icon, ListLayout, PageHeader, ProgressBar } from "@dextinity/ui";
import { parseISO } from "date-fns";
import { FormattedDate, FormattedTime, useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import { useVisibleDocumentPolling } from "../common/polling/useVisibleDocumentPolling";
import { useContentScope } from "../contentScope/Provider";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { JobRuntime } from "../cronJobs/JobRuntime";
import { JobStatusIndicator } from "../cronJobs/JobStatusIndicator";
import { DataGridSecondaryText, DataGridTitle, DataGridTitleCell } from "../dataGrid/dataGridCells";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { PublishButton } from "./PublishButton";
import type { GQLBuildsQuery } from "./PublisherPage.generated";
import { BuildStatusCell } from "./PublisherPage.sc";

const buildsQuery = gql`
    query Builds {
        autoBuildStatus {
            hasChangesSinceLastBuild
            nextCheck
        }
        builds {
            id
            status
            name
            label
            trigger
            startTime
            completionTime
            estimatedCompletionTime
        }
    }
`;

type Build = GQLBuildsQuery["builds"][number];

const buildsPollInterval = 10_000;

function getBuildProgress(build: Build): number | null {
    if (!build.startTime || !build.estimatedCompletionTime) {
        return null;
    }
    const start = parseISO(build.startTime).getTime();
    const duration = parseISO(build.estimatedCompletionTime).getTime() - start;
    if (duration <= 0) {
        return null;
    }
    // A build that takes longer than estimated stays just below complete until it actually completes
    return Math.min(99, Math.max(0, ((Date.now() - start) / duration) * 100));
}

/**
 * The site builds of all scopes with their status, and the button to start builds manually.
 */
export function PublisherPage() {
    const intl = useIntl();
    const { match } = useContentScope();
    const routeMatch = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: routeMatch.url.replace(match.url, "") });
    const { labels: dataGridLabels } = useDataGridLabels();

    const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<GQLBuildsQuery>(buildsQuery);
    useVisibleDocumentPolling({ pollInterval: buildsPollInterval, refetch, startPolling, stopPolling });

    if (error) {
        throw error;
    }

    const builds = data?.builds ?? [];
    const autoBuildStatus = data?.autoBuildStatus;

    const columns: DataGridColumn<Build>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "dextinity.pages.publisher.name", defaultMessage: "Name" }),
            render: (build) => (
                <DataGridTitleCell>
                    <DataGridTitle>{build.label || build.name}</DataGridTitle>
                    {build.label && build.name ? <DataGridSecondaryText>{build.name}</DataGridSecondaryText> : null}
                </DataGridTitleCell>
            ),
            exportValue: (build) => build.label || build.name || null,
        },
        {
            key: "status",
            header: intl.formatMessage({ id: "dextinity.pages.publisher.status", defaultMessage: "Status" }),
            width: 220,
            render: (build) => (
                <BuildStatusCell>
                    <JobStatusIndicator status={build.status} />
                    {build.status === "active" && (
                        <ProgressBar
                            value={getBuildProgress(build)}
                            size="small"
                            aria-label={intl.formatMessage({ id: "dextinity.pages.publisher.progress", defaultMessage: "Progress of the build" })}
                        />
                    )}
                </BuildStatusCell>
            ),
        },
        {
            key: "trigger",
            header: intl.formatMessage({ id: "dextinity.pages.publisher.trigger", defaultMessage: "Trigger" }),
            width: 140,
            priority: "low",
            render: (build) => <DataGridSecondaryText>{build.trigger}</DataGridSecondaryText>,
        },
        {
            key: "runtime",
            header: intl.formatMessage({ id: "dextinity.pages.publisher.runtime", defaultMessage: "Runtime" }),
            width: 280,
            render: (build) => (
                <DataGridSecondaryText>
                    <JobRuntime
                        startTime={build.startTime ? parseISO(build.startTime) : undefined}
                        completionTime={build.completionTime ? parseISO(build.completionTime) : undefined}
                    />
                </DataGridSecondaryText>
            ),
        },
    ];

    return (
        <ListLayout
            header={
                <PageHeader
                    eyebrow={intl.formatMessage({ id: "dextinity.pages.publisher.eyebrow", defaultMessage: "System · All scopes" })}
                    title={intl.formatMessage({ id: "dextinity.publisher.title", defaultMessage: "Publisher" })}
                    subtitle={
                        autoBuildStatus === undefined
                            ? undefined
                            : autoBuildStatus.hasChangesSinceLastBuild
                              ? intl.formatMessage(
                                    {
                                        id: "dextinity.pages.publisher.nextScheduledBuild",
                                        defaultMessage: "New content changes · next publication on {date} at {time}",
                                    },
                                    {
                                        date: <FormattedDate value={autoBuildStatus.nextCheck} dateStyle="medium" />,
                                        time: <FormattedTime value={autoBuildStatus.nextCheck} />,
                                    },
                                )
                              : intl.formatMessage({
                                    id: "dextinity.pages.publisher.noChanges",
                                    defaultMessage: "No new content changes since the last publication",
                                })
                    }
                    actions={<PublishButton />}
                />
            }
        >
            <DataGrid
                aria-label={intl.formatMessage({ id: "dextinity.pages.publisher.builds", defaultMessage: "Builds" })}
                columns={columns}
                rows={builds}
                getRowId={(build) => build.id}
                loading={loading && !data}
                labels={dataGridLabels}
                emptyState={
                    <EmptyState
                        icon={<Icon name="bolt" />}
                        title={intl.formatMessage({ id: "dextinity.pages.publisher.empty", defaultMessage: "No builds yet" })}
                        description={intl.formatMessage({
                            id: "dextinity.pages.publisher.emptyDescription",
                            defaultMessage: "Builds appear here once content changes are published, automatically or with Start builds.",
                        })}
                    />
                }
            />
        </ListLayout>
    );
}
