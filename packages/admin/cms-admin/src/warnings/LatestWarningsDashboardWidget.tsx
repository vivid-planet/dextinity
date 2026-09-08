import { gql, useQuery } from "@apollo/client";
import { dataGridDateTimeColumn, type GridColDef } from "@dextinity/admin";
import { Warning } from "@dextinity/admin-icons";
import { FormattedMessage, useIntl } from "react-intl";

import { DashboardWidgetRoot } from "../dashboard/widgets/DashboardWidgetRoot";
import { DataGrid } from "../dataGrid/DataGrid";
import type {
    GQLLatestWarningsListFragment,
    GQLLatestWarningsQuery,
    GQLLatestWarningsQueryVariables,
} from "./LatestWarningsDashboardWidget.generated";
import { useWarningsScopes } from "./useWarningsScopes";
import { WarningActions } from "./WarningActions";
import { WarningMessage } from "./WarningMessage";
import { useWarningsConfig } from "./warningsConfig";
import { WarningSeverity } from "./WarningSeverity";

export interface LatestWarningsDashboardWidgetProps {
    showAllScopes?: boolean;
}

export const LatestWarningsDashboardWidget = ({ showAllScopes = false }: LatestWarningsDashboardWidgetProps) => {
    const { messages } = useWarningsConfig();
    const scopes = useWarningsScopes(showAllScopes);

    const { data, loading, error } = useQuery<GQLLatestWarningsQuery, GQLLatestWarningsQueryVariables>(latestWarningsQuery, {
        variables: { scopes },
    });

    const intl = useIntl();
    if (error) {
        throw error;
    }

    const columns: GridColDef<GQLLatestWarningsListFragment>[] = [
        {
            ...disableFieldOptions,
            field: "message",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestWarningsWidget.message", defaultMessage: "Message" }),
            flex: 1,
            renderCell: (params) => <WarningMessage message={params.value} warningMessages={messages} />,
        },
        {
            ...dataGridDateTimeColumn,
            ...disableFieldOptions,
            field: "createdAt",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestWarningsWidget.dateTime", defaultMessage: "Date / Time" }),
            flex: 1,
        },
        {
            ...disableFieldOptions,
            field: "severity",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestWarningsWidget.severity", defaultMessage: "Severity" }),
            renderCell: (params) => <WarningSeverity severity={params.value} />,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            renderCell: ({ row }) => <WarningActions sourceInfo={row.sourceInfo} />,
        },
    ];

    return (
        <DashboardWidgetRoot
            icon={<Warning />}
            header={<FormattedMessage id="dextinity.dashboard.latestWarningsWidget.title" defaultMessage="Latest Warnings" />}
        >
            <DataGrid disableColumnMenu hideFooter columns={columns} rows={data?.warnings.nodes ?? []} loading={loading} />
        </DashboardWidgetRoot>
    );
};

const disableFieldOptions = {
    filterable: false,
    sortable: false,
    hideable: false,
};

const latestWarningsListFragment = gql`
    fragment LatestWarningsList on Warning {
        id
        createdAt
        message
        severity
        sourceInfo {
            rootEntityName
            jsonPath
            rootColumnName
            targetId
        }
    }
`;

const latestWarningsQuery = gql`
    query LatestWarnings($scopes: [JSONObject!]!) {
        warnings(limit: 5, scopes: $scopes, sort: { field: createdAt, direction: DESC }) {
            nodes {
                ...LatestWarningsList
            }
        }
    }
    ${latestWarningsListFragment}
`;
