import { gql, useQuery } from "@apollo/client";
import { FillSpace, MainContent, StackLink, Toolbar, ToolbarBackButton, ToolbarTitleItem, Tooltip } from "@dextinity/admin";
import { List } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { parseISO } from "date-fns";
import { FormattedMessage, useIntl } from "react-intl";

import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { DataGrid } from "../dataGrid/DataGrid";
import { JobRuntime } from "./JobRuntime";
import type {
    GQLKubernetesCronJobQuery,
    GQLKubernetesCronJobQueryVariables,
    GQLKubernetesJobsQuery,
    GQLKubernetesJobsQueryVariables,
} from "./JobsGrid.generated";
import { JobStatus } from "./JobStatus";

const disableFieldOptions = {
    filterable: false,
    sortable: false,
    hideable: false,
};

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

function JobsToolbar(props: { cronJobName: string }) {
    const { cronJobName: cronJob } = props;

    const { data } = useQuery<GQLKubernetesCronJobQuery, GQLKubernetesCronJobQueryVariables>(cronJobQuery, { variables: { name: cronJob } });

    return (
        <Toolbar scopeIndicator={<ContentScopeIndicator global />}>
            <ToolbarBackButton />
            <ToolbarTitleItem>
                <FormattedMessage
                    id="dextinity.jobs.title"
                    defaultMessage="Job runs for {cronJob}"
                    values={{
                        cronJob: data?.kubernetesCronJob.label
                            ? `${data?.kubernetesCronJob.label} (${data?.kubernetesCronJob.name})`
                            : data?.kubernetesCronJob.name,
                    }}
                />
            </ToolbarTitleItem>
            <FillSpace />
        </Toolbar>
    );
}

type JobsGridProps = {
    cronJob: string;
};

export function JobsGrid(props: JobsGridProps) {
    const { cronJob } = props;

    const intl = useIntl();

    const { data, loading, error } = useQuery<GQLKubernetesJobsQuery, GQLKubernetesJobsQueryVariables>(jobsQuery, {
        variables: { cronJobName: cronJob },
        pollInterval: 10 * 1000,
    });

    if (error) {
        throw error;
    }
    const rows = data?.kubernetesJobs ?? [];

    return (
        <>
            <JobsToolbar cronJobName={cronJob} />
            <MainContent fullHeight>
                <DataGrid
                    rows={rows}
                    loading={loading}
                    hideFooterPagination
                    columns={[
                        {
                            field: "name",
                            headerName: intl.formatMessage({ id: "dextinity.pages.jobs.name", defaultMessage: "Name" }),
                            flex: 2,
                            ...disableFieldOptions,
                        },
                        {
                            field: "status",
                            headerName: intl.formatMessage({ id: "dextinity.pages.publisher.status", defaultMessage: "Status" }),
                            flex: 1,
                            ...disableFieldOptions,
                            renderCell: ({ row }) => <JobStatus status={row.status}>{row.status}</JobStatus>,
                        },
                        {
                            field: "runtime",
                            headerName: intl.formatMessage({ id: "dextinity.pages.jobs.runtime", defaultMessage: "Runtime" }),
                            flex: 1,
                            ...disableFieldOptions,
                            valueGetter: (params, row) => {
                                return {
                                    startTime: row.startTime,
                                    completionTime: row.completionTime,
                                };
                            },
                            renderCell: ({ value }) => {
                                return (
                                    <JobRuntime
                                        startTime={value.startTime ? parseISO(value.startTime) : undefined}
                                        completionTime={value.completionTime ? parseISO(value.completionTime) : undefined}
                                    />
                                );
                            },
                        },
                        {
                            field: "actions",
                            type: "actions",
                            headerName: "",
                            renderCell: ({ row }) => (
                                <Tooltip title={<FormattedMessage id="dextinity.pages.jobs.showLogs" defaultMessage="Show logs" />}>
                                    <IconButton component={StackLink} pageName="logs" payload={row.name}>
                                        <List color="primary" />
                                    </IconButton>
                                </Tooltip>
                            ),
                            ...disableFieldOptions,
                        },
                    ]}
                    disableColumnSelector
                />
            </MainContent>
        </>
    );
}
