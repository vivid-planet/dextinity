import { Alert, RowActionsItem, RowActionsMenu, useSnackbarApi, writeClipboardText } from "@dextinity/admin";
import { Copy, Delete, Duplicate, Paste, RowInsertAbove, RowInsertBelow, RowMoveDown, RowMoveUp } from "@dextinity/admin-icons";
import { Divider, Snackbar } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import { createTableSettingsState } from "./createTableSettings";
import { FailedToPasteSnackbar } from "./FailedToPasteSnackbar";
import { useTableBlockContext } from "./TableBlockContext";
import { hasTableSettings, TableSettingsMenuItems } from "./TableSettingsMenuItems";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";
import {
    deleteRowById,
    getDuplicatedRowInsertData,
    getInsertDataFromRowById,
    insertRowDataAtIndex,
    moveRowToIndex,
    type RowInsertData,
    rowInsertSchema,
    setRowSetting,
} from "./utils/row";

type Props = {
    row: Record<string, unknown> & { id: string };
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    state: TableBlockState;
    addToRecentlyPastedIds: (id: string) => void;
};

export const RowActionsCell = ({ row, updateState, state, addToRecentlyPastedIds }: Props) => {
    const snackbarApi = useSnackbarApi();
    const blockContext = useBlockContext();
    const stateRow = state.rows.find((rowInState) => rowInState.id === row.id);
    const rowIndex = state.rows.findIndex((rowInState) => rowInState.id === row.id);
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === state.rows.length - 1;
    const intl = useIntl();
    const table = useTableBlockContext();
    const { CellBlock, rowSettings } = table;
    const settings = stateRow?.settings ?? createTableSettingsState(rowSettings);

    const handleInsertNewRow = (where: "above" | "below") => {
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);
            const newRowIndex = where === "above" ? currentRowIndex : currentRowIndex + 1;

            const insertData: RowInsertData = {
                cellValues: state.columns.map(() => CellBlock.defaultValues()),
            };
            return insertRowDataAtIndex(state, insertData, newRowIndex, table);
        });
    };

    const handleMoveRow = (direction: "up" | "down") => {
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);
            const targetRowIndex = direction === "up" ? currentRowIndex - 1 : currentRowIndex + 1;
            return moveRowToIndex({ state, rowId: row.id, targetIndex: targetRowIndex });
        });
    };

    const handleDeleteRow = () => {
        updateState((state) => {
            return deleteRowById(state, row.id);
        });
    };

    const handleSetRowSetting = (key: string, value: unknown) => {
        updateState((state) => {
            return setRowSetting(state, row.id, key, value);
        });
    };

    const handleDuplicateRow = () => {
        const duplicatedRowInsertData = getDuplicatedRowInsertData(state, row.id, table);
        const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);

        if (!duplicatedRowInsertData) {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="error">
                        <FormattedMessage id="dextinity.tableBlock.failedToDuplicateRow" defaultMessage="Failed to duplicate row" />
                    </Alert>
                </Snackbar>,
            );
            return;
        }

        updateState((state) => {
            const newRowId = uuid();
            addToRecentlyPastedIds(newRowId);
            return insertRowDataAtIndex(state, duplicatedRowInsertData, currentRowIndex + 1, table, newRowId);
        });
    };

    const handleCopyRowToClipboard = () => {
        const rowInsertData = getInsertDataFromRowById(state, row.id, table);
        if (!rowInsertData) {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="error">
                        <FormattedMessage id="dextinity.tableBlock.failedToCopyRow" defaultMessage="Failed to copy row" />
                    </Alert>
                </Snackbar>,
            );
            return;
        }

        writeClipboardText(JSON.stringify(rowInsertData));
    };

    const pasteRowFromClipboard = async () => {
        const clipboardData = await getClipboardValueForSchema(rowInsertSchema);

        if (!clipboardData) {
            snackbarApi.showSnackbar(<FailedToPasteSnackbar />);
            return;
        }

        let cellValuesToInsert: unknown[] = [];

        try {
            cellValuesToInsert = await Promise.all(clipboardData.cellValues.map((cellValue) => CellBlock.output2State(cellValue, blockContext)));
        } catch (error) {
            console.error(error);
            snackbarApi.showSnackbar(<FailedToPasteSnackbar />);
        }

        updateState((state) => {
            const newRowId = uuid();
            addToRecentlyPastedIds(newRowId);
            const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);
            return insertRowDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, currentRowIndex + 1, table, newRowId);
        });
    };

    return (
        <RowActionsMenu>
            <RowActionsMenu
                componentsProps={{
                    rowActionsIconItem: {
                        componentsProps: {
                            iconButton: {
                                "aria-label": intl.formatMessage({
                                    id: "dextinity.tableBlock.openRowOptions",
                                    defaultMessage: "Open row options",
                                }),
                            },
                        },
                    },
                }}
            >
                <TableSettingsMenuItems settings={rowSettings} values={settings} onChange={handleSetRowSetting} />
                {hasTableSettings(rowSettings) && <Divider />}
                <RowActionsItem
                    icon={<RowInsertAbove />}
                    onClick={() => {
                        handleInsertNewRow("above");
                    }}
                >
                    <FormattedMessage id="dextinity.tableBlock.addRowAbove" defaultMessage="Add row above" />
                </RowActionsItem>
                <RowActionsItem
                    icon={<RowInsertBelow />}
                    onClick={() => {
                        handleInsertNewRow("below");
                    }}
                >
                    <FormattedMessage id="dextinity.tableBlock.addRowBelow" defaultMessage="Add row below" />
                </RowActionsItem>
                <Divider />
                <RowActionsItem
                    icon={<RowMoveUp />}
                    disabled={isFirstRow}
                    onClick={() => {
                        handleMoveRow("up");
                    }}
                >
                    <FormattedMessage id="dextinity.tableBlock.moveRowUp" defaultMessage="Move up" />
                </RowActionsItem>
                <RowActionsItem
                    icon={<RowMoveDown />}
                    disabled={isLastRow}
                    onClick={() => {
                        handleMoveRow("down");
                    }}
                >
                    <FormattedMessage id="dextinity.tableBlock.moveRowDown" defaultMessage="Move down" />
                </RowActionsItem>
                <Divider />
                <RowActionsItem icon={<Copy />} onClick={handleCopyRowToClipboard}>
                    <FormattedMessage id="dextinity.tableBlock.copyRow" defaultMessage="Copy" />
                </RowActionsItem>
                <RowActionsItem icon={<Paste />} onClick={pasteRowFromClipboard}>
                    <FormattedMessage id="dextinity.tableBlock.pasteRow" defaultMessage="Paste" />
                </RowActionsItem>
                <RowActionsItem icon={<Duplicate />} onClick={handleDuplicateRow}>
                    <FormattedMessage id="dextinity.tableBlock.duplicateRow" defaultMessage="Duplicate" />
                </RowActionsItem>
                <Divider />
                <RowActionsItem icon={<Delete />} onClick={handleDeleteRow}>
                    <FormattedMessage id="dextinity.tableBlock.deleteRow" defaultMessage="Delete" />
                </RowActionsItem>
            </RowActionsMenu>
        </RowActionsMenu>
    );
};
