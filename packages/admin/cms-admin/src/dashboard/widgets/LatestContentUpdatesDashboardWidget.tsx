import type { GridColDef } from "@dextinity/admin";
import { ArrowRight, Reload } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import type { DataGridProps } from "@mui/x-data-grid";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

import { DataGrid } from "../../dataGrid/DataGrid";
import { DashboardWidgetRoot } from "./DashboardWidgetRoot";

type MinimalRow = {
    id: string;
    pageTreeNode?: unknown;
    name: string;
    updatedAt: string;
    editUrl?: string;
};

export type LatestContentUpdatesDashboardWidgetProps<Row extends MinimalRow> = {
    rows: DataGridProps<Row>["rows"] | undefined;
} & Omit<DataGridProps<Row>, "columns">;

export const LatestContentUpdatesDashboardWidget = <Row extends MinimalRow>({
    rows = [],
    loading,
}: LatestContentUpdatesDashboardWidgetProps<Row>) => {
    const intl = useIntl();
    const columns: GridColDef<Row>[] = [
        {
            ...disableFieldOptions,
            field: "name",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestContentUpdates.name", defaultMessage: "Page Name" }),
            flex: 1,
        },
        {
            ...disableFieldOptions,
            field: "updatedAt",
            headerName: intl.formatMessage({ id: "dextinity.dashboard.latestContentUpdates.updatedAt", defaultMessage: "Updated At" }),
            type: "dateTime",
            flex: 1,
            valueFormatter: (value) => (value ? intl.formatDate(value, { dateStyle: "medium", timeStyle: "short" }) : ""),
        },
        {
            ...disableFieldOptions,
            field: "editUrl",
            headerName: "",
            width: 60,
            renderCell: ({ row }) => {
                if (row.editUrl) {
                    return (
                        <IconButton component={Link} to={row.editUrl}>
                            <ArrowRight />
                        </IconButton>
                    );
                }
            },
        },
    ];

    return (
        <DashboardWidgetRoot
            icon={<Reload />}
            header={<FormattedMessage id="dextinity.dashboard.latestContentUpdatesWidget.title" defaultMessage="Latest Content Updates" />}
        >
            <DataGrid disableColumnMenu hideFooter autoHeight columns={columns} rows={rows} loading={loading} />
        </DashboardWidgetRoot>
    );
};

const disableFieldOptions = {
    filterable: false,
    sortable: false,
    hideable: false,
};
