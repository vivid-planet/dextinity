import { camelCase } from "change-case";

import type { FormattedMessageElement } from "../generate-command";
import { camelCaseToHumanReadable } from "../utils/camelCaseToHumanReadable";
import { generateFormattedMessage } from "../utils/intl";

type Options = {
    componentName: string;
    forwardToolbarAction: boolean | undefined;
    hasSearch: boolean;
    hasFilter: boolean;
    excelExport: boolean | undefined;
    allowAdding: boolean;
    instanceGqlType: string;
    gqlType: string;
    newEntryText: string | FormattedMessageElement | undefined;
    fragmentName: string;
};

export const generateGridToolbar = ({
    componentName,
    forwardToolbarAction,
    hasSearch,
    hasFilter,
    excelExport,
    allowAdding,
    instanceGqlType,
    gqlType,
    newEntryText,
    fragmentName,
}: Options) => {
    return `${renderToolbarProps(componentName, !!forwardToolbarAction, !!excelExport)}
    function ${componentName}(${getGridToolbarProps(componentName, !!forwardToolbarAction, !!excelExport)}) {
        return (
            <DataGridToolbar>
                ${hasSearch ? "<GridToolbarQuickFilter />" : ""}
                ${hasFilter ? "<GridFilterButton />" : ""}
                <FillSpace />
                ${renderToolbarActions({
                    forwardToolbarAction,
                    addItemText: generateFormattedMessage({
                        config: newEntryText,
                        id: `${instanceGqlType}.${camelCase(fragmentName)}.newEntry`,
                        defaultMessage: `New ${camelCaseToHumanReadable(gqlType)}`,
                        type: "jsx",
                    }),
                    excelExport,
                    allowAdding,
                })}
            </DataGridToolbar>
        );
    }`.replace(/^\s+\n/gm, "");
};

const getGridToolbarProps = (componentName: string, toolbarAction: boolean, exportApi: boolean) => {
    const props: Array<{
        destructured: string;
        typeDefinition: string;
    }> = [];

    if (toolbarAction) {
        props.push({
            destructured: "toolbarAction",
            typeDefinition: "toolbarAction?: ReactNode",
        });
    }

    if (exportApi) {
        props.push({
            destructured: "exportApi",
            typeDefinition: "exportApi: ExportApi",
        });
    }

    if (!props.length) {
        return "";
    }

    return `{
        ${props.map((prop) => `${prop.destructured}`).join(",")}
    }: ${componentName}ToolbarProps`;
};

type RenderToolbarActionsOptions = {
    forwardToolbarAction: boolean | undefined;
    addItemText: string | FormattedMessageElement;
    excelExport: boolean | undefined;
    allowAdding: boolean | undefined;
};

const renderToolbarActions = ({ forwardToolbarAction, addItemText, excelExport, allowAdding }: RenderToolbarActionsOptions) => {
    const showMoreActionsMenu = excelExport;

    if (!showMoreActionsMenu && !allowAdding) {
        return "";
    }

    const moreActionsMenu = `<CrudMoreActionsMenu
        slotProps={{
            button: {
                responsive: true
            }
        }}
        overallActions={[
            ${
                excelExport
                    ? `{
                        label: <FormattedMessage {...messages.downloadAsExcel} />,
                        icon: exportApi.loading ? <CircularProgress size={20} /> : <ExcelIcon />,
                        onClick: () => exportApi.exportGrid(),
                        disabled: exportApi.loading,
                    }`
                    : ""
            }
        ]}
    />`;

    const defaultAddItemButton = `<Button responsive startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add">
        ${addItemText}
    </Button>`;

    const addAction = forwardToolbarAction ? "{toolbarAction}" : defaultAddItemButton;

    return `
        ${showMoreActionsMenu ? moreActionsMenu : ""}
        ${allowAdding ? addAction : ""}`;
};

const renderToolbarProps = (componentName: string, forwardToolbarAction: boolean | undefined, exportApi: boolean) => {
    if (forwardToolbarAction || exportApi) {
        return `interface ${componentName}ToolbarProps extends GridToolbarProps {
         ${forwardToolbarAction ? "toolbarAction: ReactNode;" : ""}
         ${exportApi ? "exportApi: ExportApi;" : ""}
}`;
    }
    return "";
};
