import { gql, useQuery } from "@apollo/client";
import {
    dataGridDateTimeColumn,
    DataGridToolbar,
    GridCellContent,
    type GridColDef,
    GridFilterButton,
    GridToolbarQuickFilter,
    MainContent,
    messages,
    muiGridFilterToGql,
    muiGridSortToGql,
    ToolbarItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@dextinity/admin";
import { Chip } from "@mui/material";
import type { GridFilterModel } from "@mui/x-data-grid";
import { capitalCase } from "change-case";
import isEqual from "lodash.isequal";
import { FormattedMessage, useIntl } from "react-intl";

import { useContentScope } from "../contentScope/Provider";
import { DataGrid } from "../dataGrid/DataGrid";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import { getDisplayNameString } from "../dependencies/getDisplayNameString";
import { WarningActions } from "./WarningActions";
import { WarningMessage } from "./WarningMessage";
import { useWarningsConfig } from "./warningsConfig";
import { WarningSeverity } from "./WarningSeverity";
import type { GQLWarningsGridQuery, GQLWarningsGridQueryVariables, GQLWarningsListFragment } from "./WarningsGrid.generated";

const warningsFragment = gql`
    fragment WarningsList on Warning {
        id
        createdAt
        updatedAt
        message
        severity
        sourceInfo {
            rootEntityName
            rootColumnName
            targetId
            jsonPath
        }
        entityInfo {
            name
            secondaryInformation
        }
        scope
    }
`;

const warningsQuery = gql`
    query WarningsGrid($offset: Int, $limit: Int, $sort: [WarningSort!], $search: String, $filter: WarningFilter, $scopes: [JSONObject!]!) {
        warnings(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scopes: $scopes) {
            nodes {
                ...WarningsList
            }
            totalCount
        }
    }
    ${warningsFragment}
`;

function WarningsGridToolbar() {
    return (
        <DataGridToolbar>
            <ToolbarItem>
                <GridToolbarQuickFilter />
            </ToolbarItem>
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
        </DataGridToolbar>
    );
}

export function WarningsGrid() {
    const intl = useIntl();
    const dataGridProps = {
        ...useDataGridRemote({ initialFilter: { items: [{ field: "status", operator: "is", value: "open" }] } }),
        ...usePersistentColumnState("WarningsGrid"),
    };
    const { messages: warningMessages } = useWarningsConfig();
    const { entityDependencyMap } = useDependenciesConfig();
    const { values: scopeValues } = useContentScope();
    const scopes = scopeValues.map((item) => item.scope);

    const scopeValueOptions = scopeValues.map((item) => {
        const label: string[] = [];
        for (const [key, value] of Object.entries(item.scope)) {
            if (item.label && item.label[key]) {
                label.push(item.label[key]);
            } else if (value) {
                label.push(capitalCase(value));
            }
        }

        return {
            value: JSON.stringify(item.scope),
            label: label.join(" / "),
        };
    });

    const columns: GridColDef<GQLWarningsListFragment>[] = [
        {
            ...dataGridDateTimeColumn,
            field: "createdAt",
            headerName: intl.formatMessage({ id: "dextinity.warning.dateTime", defaultMessage: "Date / Time" }),
            width: 200,
        },
        {
            field: "severity",
            headerName: intl.formatMessage({ id: "dextinity.warning.severity", defaultMessage: "Severity" }),
            type: "singleSelect",
            valueOptions: [
                { value: "high", label: intl.formatMessage({ id: "dextinity.warning.severity.high", defaultMessage: "High" }) },
                { value: "medium", label: intl.formatMessage({ id: "dextinity.warning.severity.medium", defaultMessage: "Medium" }) },
                { value: "low", label: intl.formatMessage({ id: "dextinity.warning.severity.low", defaultMessage: "Low" }) },
            ],
            width: 150,
            renderCell: (params) => <WarningSeverity severity={params.value} />,
        },
        {
            field: "name",
            headerName: intl.formatMessage({ id: "dextinity.warning.name", defaultMessage: "Name" }),
            width: 200,
            renderCell: ({ row }) => {
                return (
                    <GridCellContent
                        primaryText={row.entityInfo?.name ?? <FormattedMessage {...messages.unknown} />}
                        secondaryText={row.entityInfo?.secondaryInformation}
                    />
                );
            },
        },
        {
            field: "secondaryInformation",
            headerName: intl.formatMessage({ id: "dextinity.warning.info", defaultMessage: "Info" }),
            sortable: false,
            visible: false,
            valueGetter: (params, row) => row.entityInfo?.secondaryInformation,
        },
        {
            field: "type",
            headerName: intl.formatMessage({ id: "dextinity.warning.type", defaultMessage: "Type" }),
            type: "singleSelect",
            valueOptions: Object.entries(entityDependencyMap).map(([value, dependency]) => ({
                value,
                label: getDisplayNameString(dependency.displayName, intl, value),
            })),
            width: 100,
            valueGetter: (params, row) => row.sourceInfo.rootEntityName,
            renderCell: ({ row }) => (
                <Chip label={entityDependencyMap[row.sourceInfo.rootEntityName]?.displayName ?? row.sourceInfo.rootEntityName} />
            ),
        },
        {
            field: "message",
            headerName: intl.formatMessage({ id: "dextinity.warning.message", defaultMessage: "Message" }),
            flex: 1,
            renderCell: (params) => <WarningMessage message={params.value} warningMessages={warningMessages} />,
        },
        {
            field: "scope",
            headerName: intl.formatMessage({ id: "dextinity.warning.scope", defaultMessage: "Scope" }),
            type: "singleSelect",
            sortable: false,
            valueOptions: scopeValueOptions,
            valueFormatter: (value) => {
                if (typeof value === "object" && value !== null) {
                    // Check if there is a scope value in the options, if so, return the label
                    const scope = scopeValueOptions.find((scope) => {
                        return isEqual(JSON.parse(scope.value), value);
                    });
                    if (scope) {
                        return scope.label;
                    }

                    // Otherwise if it's still an object, format it with capitalCase
                    // This might be the case if the scope is only partially defined (for a scope with domain/language, only domain is defined)
                    const objectValues = Object.values(value);
                    const formattedValues = objectValues.map((value) => (typeof value === "string" ? capitalCase(value) : value)).join(" / ");
                    return formattedValues;
                }

                return intl.formatMessage(messages.globalContentScope);
            },
        },
        {
            field: "actions",
            headerName: "",
            filterable: false,
            sortable: false,
            renderCell: ({ row }) => <WarningActions scope={row.scope} sourceInfo={row.sourceInfo} />,
        },
    ];

    function gridFilterToGql(columns: GridColDef[], filterModel?: GridFilterModel) {
        // Create a custom filter model by transforming the filterModel's items
        const customFilterModel = {
            ...filterModel,
            items:
                filterModel?.items.map((item) => {
                    if (item.field === "scope") {
                        if (typeof item.value === "string") {
                            return { ...item, value: JSON.parse(item.value) };
                        }

                        if (typeof item.value === "object" && Array.isArray(item.value)) {
                            return { ...item, value: item.value.map((value) => JSON.parse(value)) };
                        }
                    }

                    return item;
                }) ?? [],
        };

        return muiGridFilterToGql(columns, customFilterModel);
    }

    const { filter: gqlFilter, search: gqlSearch } = gridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLWarningsGridQuery, GQLWarningsGridQueryVariables>(warningsQuery, {
        variables: {
            scopes,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel, columns),
        },
    });
    const rowCount = useBufferedRowCount(data?.warnings.totalCount);
    if (error) {
        throw error;
    }
    const rows = data?.warnings.nodes ?? [];

    return (
        <MainContent fullHeight>
            <DataGrid
                {...dataGridProps}
                disableRowSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                slots={{
                    toolbar: WarningsGridToolbar,
                }}
                showToolbar
            />
        </MainContent>
    );
}
