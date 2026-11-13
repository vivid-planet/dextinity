import { gql, useQuery } from "@apollo/client";
import { Button, CardRow, EmptyState, Icon, IconButton, Link, LogViewer, type LogViewerLineTone, Panel, Skeleton } from "@dextinity/ui";
import { differenceInMinutes, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { useVisibleDocumentPolling } from "../common/polling/useVisibleDocumentPolling";
import type {
    GQLKubernetesCronJobQuery,
    GQLKubernetesCronJobQueryVariables,
    GQLKubernetesJobsQuery,
    GQLKubernetesJobsQueryVariables,
    GQLKubernetesJobWithLogsQuery,
    GQLKubernetesJobWithLogsQueryVariables,
} from "./CronJobRunsPanel.generated";
import { CronJobRuns, CronJobRunsContent } from "./CronJobRunsPanel.sc";
import { getCronJobTitle } from "./cronJobTitle";
import { JobStatusIndicator } from "./JobStatusIndicator";

const cronJobQuery = gql`
    query KubernetesCronJob($name: String!) {
        kubernetesCronJob(name: $name) {
            id
            name
            label
        }
    }
`;

const jobsQuery = gql`
    query KubernetesJobs($cronJobName: String!) {
        kubernetesJobs(cronJobName: $cronJobName) {
            id
            name
            startTime
            completionTime
            status
        }
    }
`;

const jobWithLogsQuery = gql`
    query KubernetesJobWithLogs($name: String!) {
        kubernetesJob(name: $name) {
            id
            name
            label
            status
        }
        kubernetesJobLogs(name: $name)
    }
`;

const jobsPollInterval = 10_000;
const runningJobLogsPollInterval = 5_000;

function getLogLineTone(line: string): LogViewerLineTone | undefined {
    if (/\b(error|fatal)\b/i.test(line)) {
        return "error";
    }
    if (/\bwarn(ing)?\b/i.test(line)) {
        return "warning";
    }
    return undefined;
}

interface CronJobRunsPanelProps {
    cronJobName: string;
    /** The run whose logs are shown instead of the list of runs. */
    jobName?: string;
    runsUrl: string;
    logsUrl: (jobName: string) => string;
    onClose: () => void;
    onRunNow?: () => void;
}

export function CronJobRunsPanel({ cronJobName, jobName, runsUrl, logsUrl, onClose, onRunNow }: CronJobRunsPanelProps) {
    const intl = useIntl();
    const { data: cronJobData } = useQuery<GQLKubernetesCronJobQuery, GQLKubernetesCronJobQueryVariables>(cronJobQuery, {
        variables: { name: cronJobName },
    });
    const cronJob = cronJobData?.kubernetesCronJob;

    return (
        <Panel
            title={cronJob ? getCronJobTitle(cronJob) : cronJobName}
            description={
                jobName ?? intl.formatMessage({ id: "dextinity.jobs.title", defaultMessage: "Job runs for {cronJob}" }, { cronJob: cronJobName })
            }
            actions={
                <IconButton
                    aria-label={intl.formatMessage({ id: "dextinity.pages.cronJobs.closeRuns", defaultMessage: "Close" })}
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={onClose}
                >
                    <Icon name="close" />
                </IconButton>
            }
        >
            <CronJobRunsContent>
                {jobName === undefined ? (
                    <>
                        {onRunNow && (
                            <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="play" />} onClick={onRunNow}>
                                {intl.formatMessage({ id: "dextinity.pages.cronJobs.runJobNow", defaultMessage: "Run job now" })}
                            </Button>
                        )}
                        <JobRuns cronJobName={cronJobName} logsUrl={logsUrl} />
                    </>
                ) : (
                    <>
                        <Link render={<RouterLink to={runsUrl} />} startIcon={<Icon name="arrow-left" />}>
                            {intl.formatMessage({ id: "dextinity.pages.cronJobs.allRuns", defaultMessage: "All runs" })}
                        </Link>
                        <JobLogs jobName={jobName} />
                    </>
                )}
            </CronJobRunsContent>
        </Panel>
    );
}

function JobRuns({ cronJobName, logsUrl }: { cronJobName: string; logsUrl: (jobName: string) => string }) {
    const intl = useIntl();
    const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<GQLKubernetesJobsQuery, GQLKubernetesJobsQueryVariables>(
        jobsQuery,
        { variables: { cronJobName } },
    );
    useVisibleDocumentPolling({ pollInterval: jobsPollInterval, refetch, startPolling, stopPolling });

    if (error) {
        throw error;
    }
    if (loading && !data) {
        return <Skeleton variant="row" count={4} />;
    }

    const jobs = data?.kubernetesJobs ?? [];
    if (jobs.length === 0) {
        return (
            <EmptyState
                icon={<Icon name="clock" />}
                title={intl.formatMessage({ id: "dextinity.pages.cronJobs.noRuns", defaultMessage: "No runs yet" })}
            />
        );
    }

    return (
        <CronJobRuns aria-label={intl.formatMessage({ id: "dextinity.pages.cronJobs.runs", defaultMessage: "Runs" })}>
            {jobs.map((job) => (
                <li key={job.id}>
                    <CardRow
                        render={<RouterLink to={logsUrl(job.name)} />}
                        title={job.startTime ? <FormattedDate value={job.startTime} dateStyle="medium" timeStyle="short" /> : job.name}
                        subtitle={
                            job.startTime && job.completionTime
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.pages.cronJobs.runDuration",
                                          defaultMessage: "{runtime, plural, =0 {< 1 min} other {# min}} · {name}",
                                      },
                                      { runtime: differenceInMinutes(parseISO(job.completionTime), parseISO(job.startTime)), name: job.name },
                                  )
                                : job.name
                        }
                        end={<JobStatusIndicator status={job.status} />}
                    />
                </li>
            ))}
        </CronJobRuns>
    );
}

function JobLogs({ jobName }: { jobName: string }) {
    const intl = useIntl();
    const [isPolling, setIsPolling] = useState(false);
    const { data, loading, error, refetch, startPolling, stopPolling } = useQuery<
        GQLKubernetesJobWithLogsQuery,
        GQLKubernetesJobWithLogsQueryVariables
    >(jobWithLogsQuery, { variables: { name: jobName } });
    useVisibleDocumentPolling({ pollInterval: isPolling ? runningJobLogsPollInterval : 0, refetch, startPolling, stopPolling });
    const isRunning = data?.kubernetesJob.status === "active" || data?.kubernetesJob.status === "pending";

    useEffect(() => {
        setIsPolling(isRunning);
    }, [isRunning]);

    if (error) {
        throw error;
    }
    if (loading && !data) {
        return <Skeleton variant="row" count={6} />;
    }

    const logs = data?.kubernetesJobLogs ?? "";

    if (!isRunning && logs === "") {
        return (
            <EmptyState
                icon={<Icon name="list" />}
                title={intl.formatMessage({ id: "dextinity.pages.cronJobs.noLogsTitle", defaultMessage: "No logs available" })}
                description={intl.formatMessage({
                    id: "dextinity.cronJobs.noLogs",
                    defaultMessage: "No logs available. You may consider checking external logging tools if available.",
                })}
            />
        );
    }

    return (
        <LogViewer
            content={logs}
            title={data?.kubernetesJob.label || jobName}
            follow={isRunning}
            loading={isRunning}
            wrap
            getLineTone={getLogLineTone}
            labels={{
                log: intl.formatMessage({ id: "dextinity.jobLogs.log", defaultMessage: "Log" }),
                copy: intl.formatMessage({ id: "dextinity.jobLogs.copy", defaultMessage: "Copy log" }),
                copied: intl.formatMessage({ id: "dextinity.jobLogs.copied", defaultMessage: "Copied" }),
                jumpToLatest: intl.formatMessage({ id: "dextinity.jobLogs.jumpToLatest", defaultMessage: "Jump to latest" }),
                empty: intl.formatMessage({ id: "dextinity.jobLogs.empty", defaultMessage: "No output yet" }),
            }}
        />
    );
}
