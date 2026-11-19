import { Alert, RowActionsItem, RowActionsMenu, useSnackbarApi, writeClipboardText } from "@dextinity/admin";
import { Add, Copy, Delete, Duplicate, Paste, Remove, RowInsertAbove, RowInsertBelow, RowMoveDown, RowMoveUp } from "@dextinity/admin-icons";
import { Divider, Snackbar } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import { FailedToPasteSnackbar } from "./FailedToPasteSnackbar";
import { useTableBlockContext } from "./TableBlockContext";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";
import {
    deleteRowById,
    getDuplicatedRowInsertData,
    getInsertDataFromRowById,
    insertRowDataAtIndex,
    moveRowToIndex,
    type RowInsertData,
    rowInsertSchema,
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
    const { RichTextBlock } = useTableBlockContext();

    const handleInsertNewRow = (where: "above" | "below") => {
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);
            const newRowIndex = where === "above" ? currentRowIndex : currentRowIndex + 1;

            const insertData: RowInsertData = {
                highlighted: false,
                cellValues: state.columns.map(() => RichTextBlock.defaultValues()),
            };
            return insertRowDataAtIndex(state, insertData, newRowIndex, RichTextBlock);
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

    const toggleRowHighlight = () => {
        updateState((state) => {
            return {
                ...state,
                rows: state.rows.map((rowInState) => {
                    if (rowInState.id === row.id) {
                        return { ...rowInState, highlighted: !rowInState.highlighted };
                    }
                    return rowInState;
                }),
            };
        });
    };

    const handleDuplicateRow = () => {
        const duplicatedRowInsertData = getDuplicatedRowInsertData(state, row.id, RichTextBlock);
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
            return insertRowDataAtIndex(state, duplicatedRowInsertData, currentRowIndex + 1, RichTextBlock, newRowId);
        });
    };

    const handleCopyRowToClipboard = () => {
        const rowInsertData = getInsertDataFromRowById(state, row.id, RichTextBlock);
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
            cellValuesToInsert = await Promise.all(clipboardData.cellValues.map((cellValue) => RichTextBlock.output2State(cellValue, blockContext)));
        } catch (error) {
            console.error(error);
            snackbarApi.showSnackbar(<FailedToPasteSnackbar />);
        }

        updateState((state) => {
            const newRowId = uuid();
            addToRecentlyPastedIds(newRowId);
            const currentRowIndex = state.rows.findIndex(({ id }) => id === row.id);
            return insertRowDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, currentRowIndex + 1, RichTextBlock, newRowId);
        });
    };

    return (
        <RowActionsMenu>
            <RowActionsMenu
                componentsProps={{
                    rowActionsIconItem: {
                        componentsProps: {
                            iconButton: {
                                "aria-label": intl.formatMessage({ id: "dextinity.tableBlock.openRowOptions", defaultMessage: "Open row options" }),
                            },
                        },
                    },
                }}
            >
                <RowActionsItem
                    icon={stateRow?.highlighted ? <Remove /> : <Add />}
                    onClick={() => {
                        toggleRowHighlight();
                    }}
                >
                    {stateRow?.highlighted ? (
                        <FormattedMessage id="dextinity.tableBlock.removeHighlighting" defaultMessage="Remove highlighting" />
                    ) : (
                        <FormattedMessage id="dextinity.tableBlock.highlightRow" defaultMessage="Highlight row" />
                    )}
                </RowActionsItem>
                <Divider />
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
