import { gql, useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import {
    ConfirmDialog,
    DataGrid,
    type DataGridColumn,
    EmptyState,
    Icon,
    IconButton,
    PageHeader,
    StatusIndicator,
    ToastViewport,
    Tooltip,
    useToasts,
} from "@dextinity/ui";
import { parseISO } from "date-fns";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router";

import { DataGridMonoText, DataGridRowActions, DataGridSecondaryText, DataGridTitle, DataGridTitleCell } from "../dataGrid/dataGridCells";
import { useDataGridLabels } from "../dataGrid/remoteList/useDataGridLabels";
import { CronJobRunsPanel } from "./CronJobRunsPanel";
import type {
    GQLKubernetesCronJobsQuery,
    GQLTriggerKubernetesCronJobMutation,
    GQLTriggerKubernetesCronJobMutationVariables,
} from "./CronJobsPage.generated";
import { CronJobsLayout, LastJobRunCell } from "./CronJobsPage.sc";
import { getCronJobTitle } from "./cronJobTitle";
import { JobRuntime } from "./JobRuntime";
import { JobStatusIndicator } from "./JobStatusIndicator";

const cronJobsQuery = gql`
    query KubernetesCronJobs {
        kubernetesCronJobs {
            id
            name
            label
            schedule
            suspended
            lastScheduledAt
            lastJobRun {
                id
                name
                startTime
                completionTime
                status
            }
        }
    }
`;

const triggerCronJobMutation = gql`
    mutation TriggerKubernetesCronJob($name: String!) {
        triggerKubernetesCronJob(name: $name) {
            id
            name
        }
    }
`;

type CronJob = GQLKubernetesCronJobsQuery["kubernetesCronJobs"][number];

/**
 * The cron jobs of the project with their schedule and last run. A click on a cron job opens its runs and their logs next to the list.
 */
export function CronJobsPage() {
    const intl = useIntl();
    const history = useHistory();
    const { path, url } = useRouteMatch();
    const detailMatch = useRouteMatch<{ cronJobName: string; jobName?: string }>([
        `${path}/:cronJobName/jobs/:jobName/logs`,
        `${path}/:cronJobName/jobs`,
    ]);
    const openCronJobName = detailMatch?.params.cronJobName;
    const openJobName = detailMatch?.params.jobName;
    const { labels: dataGridLabels } = useDataGridLabels();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
    const [cronJobToStart, setCronJobToStart] = useState<CronJob>();

    const { data, loading, error } = useQuery<GQLKubernetesCronJobsQuery>(cronJobsQuery);
    const [triggerCronJob, { loading: starting }] = useMutation<GQLTriggerKubernetesCronJobMutation, GQLTriggerKubernetesCronJobMutationVariables>(
        triggerCronJobMutation,
        { refetchQueries: ["KubernetesCronJobs", "KubernetesJobs"], context: LocalErrorScopeApolloContext },
    );

    if (error) {
        throw error;
    }

    const cronJobs = data?.kubernetesCronJobs ?? [];
    const openCronJob = cronJobs.find((cronJob) => cronJob.name === openCronJobName);
    const suspendedCount = cronJobs.filter((cronJob) => cronJob.suspended).length;

    const runsUrl = (cronJobName: string) => `${url}/${encodeURIComponent(cronJobName)}/jobs`;
    const logsUrl = (cronJobName: string, jobName: string) => `${runsUrl(cronJobName)}/${encodeURIComponent(jobName)}/logs`;

    const startCronJob = async (cronJob: CronJob) => {
        try {
            await triggerCronJob({ variables: { name: cronJob.name } });
        } catch {
            addToast({
                tone: "error",
                message: intl.formatMessage(
                    { id: "dextinity.pages.cronJobs.startFailed", defaultMessage: "{cronJob} couldn't be started" },
                    { cronJob: getCronJobTitle(cronJob) },
                ),
            });
            setCronJobToStart(undefined);
            return;
        }
        setCronJobToStart(undefined);
        addToast({
            icon: <Icon name="play" />,
            message: intl.formatMessage(
                { id: "dextinity.pages.cronJobs.started", defaultMessage: "{cronJob} started" },
                { cronJob: getCronJobTitle(cronJob) },
            ),
        });
        history.push(runsUrl(cronJob.name));
    };

    const runNowLabel = intl.formatMessage({ id: "dextinity.pages.cronJobs.runJobNow", defaultMessage: "Run job now" });

    const columns: DataGridColumn<CronJob>[] = [
        {
            key: "name",
            header: intl.formatMessage({ id: "dextinity.pages.cronJobs.name", defaultMessage: "Name" }),
            render: (cronJob) => (
                <DataGridTitleCell>
                    <DataGridTitle>{getCronJobTitle(cronJob)}</DataGridTitle>
                    {cronJob.label ? <DataGridSecondaryText>{cronJob.name}</DataGridSecondaryText> : null}
                </DataGridTitleCell>
            ),
        },
        {
            key: "schedule",
            header: intl.formatMessage({ id: "dextinity.pages.cronJobs.schedule", defaultMessage: "Schedule" }),
            width: 140,
            priority: "low",
            render: (cronJob) => <DataGridMonoText>{cronJob.schedule}</DataGridMonoText>,
        },
        {
            key: "suspended",
            header: intl.formatMessage({ id: "dextinity.pages.cronJobs.status", defaultMessage: "Status" }),
            width: 130,
            render: (cronJob) =>
                cronJob.suspended ? (
                    <StatusIndicator status="unpublished">
                        {intl.formatMessage({ id: "dextinity.pages.cronJobs.suspended", defaultMessage: "Suspended" })}
                    </StatusIndicator>
                ) : (
                    <StatusIndicator status="published">
                        {intl.formatMessage({ id: "dextinity.pages.cronJobs.active", defaultMessage: "Active" })}
                    </StatusIndicator>
                ),
        },
        {
            key: "lastJobRun",
            header: intl.formatMessage({ id: "dextinity.pages.cronJobs.lastJobRun", defaultMessage: "Last Job Run" }),
            render: ({ lastJobRun }) =>
                lastJobRun ? (
                    <LastJobRunCell>
                        <JobStatusIndicator status={lastJobRun.status} />
                        <DataGridSecondaryText>
                            <JobRuntime
                                startTime={lastJobRun.startTime ? parseISO(lastJobRun.startTime) : undefined}
                                completionTime={lastJobRun.completionTime ? parseISO(lastJobRun.completionTime) : undefined}
                            />
                        </DataGridSecondaryText>
                    </LastJobRunCell>
                ) : (
                    <DataGridSecondaryText>
                        {intl.formatMessage({ id: "dextinity.pages.cronJobs.never", defaultMessage: "Never" })}
                    </DataGridSecondaryText>
                ),
        },
    ];

    return (
        <>
            <CronJobsLayout
                data-logs={openJobName !== undefined ? "" : undefined}
                open={openCronJobName !== undefined}
                onOpenChange={(open) => {
                    if (!open) {
                        history.push(url);
                    }
                }}
                sidePanelLabel={intl.formatMessage(
                    { id: "dextinity.pages.cronJobs.runsOf", defaultMessage: "Runs of {cronJob}" },
                    { cronJob: openCronJob ? getCronJobTitle(openCronJob) : openCronJobName },
                )}
                header={
                    <PageHeader
                        eyebrow={intl.formatMessage({ id: "dextinity.pages.cronJobs.eyebrow", defaultMessage: "System · All scopes" })}
                        title={intl.formatMessage({ id: "dextinity.pages.cronJobs", defaultMessage: "Cron Jobs" })}
                        subtitle={
                            data
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.pages.cronJobs.subtitle",
                                          defaultMessage:
                                              "{count, plural, one {# cron job} other {# cron jobs}}{suspendedCount, plural, =0 {} other { · # suspended}}",
                                      },
                                      { count: cronJobs.length, suspendedCount },
                                  )
                                : undefined
                        }
                    />
                }
                sidePanel={
                    openCronJobName !== undefined && (
                        <CronJobRunsPanel
                            key={openCronJobName}
                            cronJobName={openCronJobName}
                            jobName={openJobName}
                            runsUrl={runsUrl(openCronJobName)}
                            logsUrl={(jobName) => logsUrl(openCronJobName, jobName)}
                            onClose={() => history.push(url)}
                            onRunNow={openCronJob ? () => setCronJobToStart(openCronJob) : undefined}
                        />
                    )
                }
            >
                <DataGrid
                    aria-label={intl.formatMessage({ id: "dextinity.pages.cronJobs", defaultMessage: "Cron Jobs" })}
                    columns={columns}
                    rows={cronJobs}
                    getRowId={(cronJob) => cronJob.id}
                    loading={loading && !data}
                    activeRowId={openCronJob?.id}
                    columnVisibility={{ lastJobRun: openCronJobName === undefined }}
                    onRowClick={(cronJob) => history.push(runsUrl(cronJob.name))}
                    rowActions={(cronJob) => (
                        <DataGridRowActions>
                            <Tooltip content={runNowLabel}>
                                <IconButton
                                    aria-label={runNowLabel}
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                    onClick={() => setCronJobToStart(cronJob)}
                                >
                                    <Icon name="play" />
                                </IconButton>
                            </Tooltip>
                        </DataGridRowActions>
                    )}
                    labels={dataGridLabels}
                    emptyState={
                        <EmptyState
                            icon={<Icon name="time" />}
                            title={intl.formatMessage({ id: "dextinity.pages.cronJobs.empty", defaultMessage: "No cron jobs" })}
                            description={intl.formatMessage({
                                id: "dextinity.pages.cronJobs.emptyDescription",
                                defaultMessage: "Cron jobs are set up in the deployment of the project.",
                            })}
                        />
                    }
                />
            </CronJobsLayout>
            <ConfirmDialog
                open={cronJobToStart !== undefined}
                onOpenChange={(open) => {
                    if (!open && !starting) {
                        setCronJobToStart(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.pages.cronjob.dialog.title", defaultMessage: "Start cron job now?" })}
                description={intl.formatMessage(
                    {
                        id: "dextinity.pages.cronjob.dialog.content",
                        defaultMessage: "Are you sure you want to start the {cronJobName} cron job now?",
                    },
                    { cronJobName: cronJobToStart ? getCronJobTitle(cronJobToStart) : "" },
                )}
                confirmLabel={intl.formatMessage({ id: "dextinity.pages.cronjob.dialog.action", defaultMessage: "Start now" })}
                confirmIcon={<Icon name="play" />}
                loading={starting}
                onConfirm={() => {
                    if (cronJobToStart) {
                        void startCronJob(cronJobToStart);
                    }
                }}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.pages.cronJobs.notifications", defaultMessage: "Notifications" }) }}
            />
        </>
    );
}
