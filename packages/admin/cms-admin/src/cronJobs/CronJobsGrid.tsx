import { gql, useApolloClient, useQuery } from "@apollo/client";
import { Button, CancelButton, StackLink, Tooltip, useStackSwitchApi } from "@dextinity/admin";
import { Play, Time } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { parseISO } from "date-fns";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { DataGrid } from "../dataGrid/DataGrid";
import type {
    GQLKubernetesCronJobsQuery,
    GQLKubernetesCronJobsQueryVariables,
    GQLTriggerKubernetesCronJobMutation,
    GQLTriggerKubernetesCronJobMutationVariables,
} from "./CronJobsGrid.generated";
import { JobRuntime } from "./JobRuntime";
import { JobStatus } from "./JobStatus";

const disableFieldOptions = {
    filterable: false,
    sortable: false,
    hideable: false,
};

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

export function CronJobsGrid() {
    const intl = useIntl();
    const client = useApolloClient();
    const stackSwitchApi = useStackSwitchApi();
    const [cronJobToStart, setCronJobToStart] = useState<string>();
    const dialogOpen = Boolean(cronJobToStart);

    const { data, loading, error } = useQuery<GQLKubernetesCronJobsQuery, GQLKubernetesCronJobsQueryVariables>(cronJobsQuery);

    if (error) {
        throw error;
    }
    const rows = data?.kubernetesCronJobs ?? [];

    const closeDialog = () => {
        setCronJobToStart(undefined);
    };
    return (
        <>
            <DataGrid
                rows={rows}
                loading={loading}
                hideFooterPagination
                columns={[
                    {
                        field: "name",
                        headerName: intl.formatMessage({ id: "dextinity.pages.cronJobs.name", defaultMessage: "Name" }),
                        flex: 2,
                        ...disableFieldOptions,
                        valueGetter: (params, row) => {
                            return {
                                name: row.name,
                                label: row.label,
                            };
                        },
                        renderCell: ({ value }) => {
                            return value.label ? `${value.label} (${value.name})` : value.name;
                        },
                    },
                    {
                        field: "schedule",
                        headerName: intl.formatMessage({ id: "dextinity.pages.cronJobs.schedule", defaultMessage: "Schedule" }),
                        flex: 1,
                        ...disableFieldOptions,
                    },
                    {
                        field: "suspended",
                        headerName: intl.formatMessage({ id: "dextinity.pages.cronJobs.status", defaultMessage: "Status" }),
                        flex: 1,
                        ...disableFieldOptions,
                        renderCell: ({ value }) => {
                            return value ? (
                                <FormattedMessage id="dextinity.pages.cronJobs.suspended" defaultMessage="Suspended" />
                            ) : (
                                <FormattedMessage id="dextinity.pages.cronJobs.active" defaultMessage="Active" />
                            );
                        },
                    },
                    {
                        field: "lastJobRun",
                        headerName: intl.formatMessage({ id: "dextinity.pages.cronJobs.lastJobRun", defaultMessage: "Last Job Run" }),
                        flex: 2,
                        renderCell: ({ value }) => {
                            return value ? (
                                <>
                                    <JobStatus status={value.status}>{value.status}</JobStatus>
                                    {", "}
                                    <JobRuntime
                                        startTime={value.startTime ? parseISO(value.startTime) : undefined}
                                        completionTime={value.completionTime ? parseISO(value.completionTime) : undefined}
                                    />
                                </>
                            ) : (
                                <FormattedMessage id="dextinity.pages.cronJobs.never" defaultMessage="Never" />
                            );
                        },
                        ...disableFieldOptions,
                    },
                    {
                        field: "actions",
                        type: "actions",
                        headerName: "",
                        renderCell: ({ row }) => (
                            <>
                                <Tooltip title={<FormattedMessage id="dextinity.pages.cronJobs.showRuns" defaultMessage="Show runs" />}>
                                    <IconButton component={StackLink} pageName="jobs" payload={row.name}>
                                        <Time color="primary" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={<FormattedMessage id="dextinity.pages.cronJobs.runJobNow" defaultMessage="Run job now" />}>
                                    <IconButton>
                                        <Play
                                            color="primary"
                                            onClick={() => {
                                                setCronJobToStart(row.name);
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ),
                        ...disableFieldOptions,
                    },
                ]}
                disableColumnSelector
            />
            <Dialog open={dialogOpen} onClose={closeDialog}>
                <DialogTitle>
                    <FormattedMessage id="dextinity.pages.cronjob.dialog.title" defaultMessage="Start cron job now?" />
                </DialogTitle>
                <DialogContent>
                    <FormattedMessage
                        id="dextinity.pages.cronjob.dialog.content"
                        defaultMessage="Are you sure you want to start the {cronJobName} cron job now?"
                        values={{
                            cronJobName: cronJobToStart,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={closeDialog} />

                    <Button
                        startIcon={<Play />}
                        onClick={async () => {
                            if (cronJobToStart) {
                                await client.mutate<GQLTriggerKubernetesCronJobMutation, GQLTriggerKubernetesCronJobMutationVariables>({
                                    mutation: triggerCronJobMutation,
                                    variables: { name: cronJobToStart },
                                });
                                stackSwitchApi.activatePage("jobs", cronJobToStart);
                            }
                        }}
                    >
                        <FormattedMessage id="dextinity.pages.cronjob.dialog.action" defaultMessage="Start now" />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
