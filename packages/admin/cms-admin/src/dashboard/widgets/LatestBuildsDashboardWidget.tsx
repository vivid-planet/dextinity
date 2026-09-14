import { gql, useQuery } from "@apollo/client";
import type { GridColDef } from "@dextinity/admin";
import { parseISO } from "date-fns";
import { FormattedMessage, useIntl } from "react-intl";

import { JobRuntime } from "../../cronJobs/JobRuntime";
import { JobStatus } from "../../cronJobs/JobStatus";
import { DataGrid } from "../../dataGrid/DataGrid";
import { DashboardWidgetRoot } from "./DashboardWidgetRoot";
import type { GQLLatestBuildsQuery, GQLLatestBuildsQueryVariables } from "./LatestBuildsDashboardWidget.generated";

export const LatestBuildsDashboardWidget = () => {
    const { data, loading, error } = useQuery<GQLLatestBuildsQuery, GQLLatestBuildsQueryVariables>(latestBuildsQuery);

    const intl = useIntl();

    if (error) {
        throw error;
    }

    const columns: GridColDef<GQLLatestBuildsQuery["builds"][number]>[] = [
        {
            ...disableFieldOptions,
            field: "runtime",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestBuildsWidget.runtime", defaultMessage: "Runtime" }),
            flex: 1,
            renderCell: ({ row }) => (
                <JobRuntime
                    startTime={row.startTime ? parseISO(row.startTime) : undefined}
                    completionTime={row.completionTime ? parseISO(row.completionTime) : undefined}
                />
            ),
        },
        {
            ...disableFieldOptions,
            field: "status",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestBuildsWidget.status", defaultMessage: "Status" }),
            width: 150,
            renderCell: ({ row }) => <JobStatus status={row.status}>{row.status}</JobStatus>,
        },
    ];

    return (
        <DashboardWidgetRoot header={<FormattedMessage id="dextinity.dashboard.latestBuildsWidget.title" defaultMessage="Latest Builds" />}>
            <DataGrid disableColumnMenu hideFooter autoHeight columns={columns} rows={data?.builds ?? []} loading={loading} />
        </DashboardWidgetRoot>
    );
};

const disableFieldOptions = {
    filterable: false,
    sortable: false,
    hideable: false,
};

const latestBuildsQuery = gql`
    query LatestBuilds {
        builds(limit: 5) {
            id
            status
            name
            trigger
            startTime
            completionTime
        }
    }
`;
