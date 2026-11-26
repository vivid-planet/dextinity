import { Alert, RowActionsItem, RowActionsMenu, useSnackbarApi, writeClipboardText } from "@dextinity/admin";
import {
    ColumnInsertLeft,
    ColumnInsertRight,
    ColumnMoveLeft,
    ColumnMoveRight,
    Copy,
    Delete,
    DragIndicator,
    Duplicate,
    Paste,
} from "@dextinity/admin-icons";
import { ButtonBase, Divider, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { GridColumnHeaderParams } from "@mui/x-data-grid";
import type { Dispatch, SetStateAction } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import type { TableSettingsState } from "./createTableSettings";
import { FailedToPasteSnackbar } from "./FailedToPasteSnackbar";
import { useTableBlockContext } from "./TableBlockContext";
import { hasTableSettings, TableSettingsMenuItems } from "./TableSettingsMenuItems";
import {
    columnInsertSchema,
    getDuplicatedColumnInsertData,
    getInsertDataFromColumnById,
    insertColumnDataAtIndex,
    moveColumnToIndex,
    removeColumnFromState,
    setColumnSetting,
} from "./utils/column";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";

type Props = GridColumnHeaderParams & {
    settings: TableSettingsState;
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    columnIndex: number;
    isDraggable?: boolean;
    addToRecentlyPastedIds: (id: string) => void;
};

export const ColumnHeader = ({ settings, state, updateState, columnIndex, isDraggable, field: columnId, addToRecentlyPastedIds }: Props) => {
    const snackbarApi = useSnackbarApi();
    const blockContext = useBlockContext();
    const intl = useIntl();
    const table = useTableBlockContext();
    const { CellBlock, columnSettings } = table;
    const isFirstColumn = columnIndex === 0;
    const isLastColumn = columnIndex === state.columns.length - 1;

    const handleInsertColumnAtIndex = (newColumnIndex: number) => {
        updateState((state) => {
            const newColumnInsertData = {
                cellValues: state.rows.map(() => CellBlock.defaultValues()),
            };
            return insertColumnDataAtIndex(state, newColumnInsertData, newColumnIndex, table);
        });
    };

    const handleMoveColumn = (direction: "left" | "right") => {
        updateState((state) => {
            const currentColumnIndex = state.columns.findIndex(({ id }) => id === columnId);
            const targetColumnIndex = direction === "left" ? currentColumnIndex - 1 : currentColumnIndex + 1;
            return moveColumnToIndex({ state, columnId, targetIndex: targetColumnIndex });
        });
    };

    const handleDeleteColumn = () => {
        updateState((state) => {
            return removeColumnFromState(state, columnId);
        });
    };

    const handleSetColumnSetting = (key: string, value: unknown) => {
        updateState((state) => {
            return setColumnSetting(state, columnId, key, value);
        });
    };

    const handleDuplicateColumn = () => {
        updateState((state) => {
            const duplicatedColumnInsertData = getDuplicatedColumnInsertData(state, columnIndex, table);
            if (!duplicatedColumnInsertData) {
                snackbarApi.showSnackbar(
                    <Snackbar autoHideDuration={5000}>
                        <Alert severity="error">
                            <FormattedMessage id="dextinity.tableBlock.failedToDuplicateColumn" defaultMessage="Failed to duplicate column" />
                        </Alert>
                    </Snackbar>,
                );
                return state;
            }

            const newColumnId = uuid();
            addToRecentlyPastedIds(newColumnId);
            return insertColumnDataAtIndex(state, duplicatedColumnInsertData, columnIndex + 1, table, newColumnId);
        });
    };

    const handleCopyColumnToClipboard = () => {
        const columnInsertData = getInsertDataFromColumnById(state, columnId, table);
        if (!columnInsertData) {
            snackbarApi.showSnackbar(
                <Snackbar autoHideDuration={5000}>
                    <Alert severity="error">
                        <FormattedMessage id="dextinity.tableBlock.failedToCopyColumn" defaultMessage="Failed to copy column" />
                    </Alert>
                </Snackbar>,
            );
            return;
        }

        writeClipboardText(JSON.stringify(columnInsertData));
    };

    const pasteColumnFromClipboard = async () => {
        const clipboardData = await getClipboardValueForSchema(columnInsertSchema);
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
            const newColumnId = uuid();
            addToRecentlyPastedIds(newColumnId);
            return insertColumnDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, columnIndex + 1, table, newColumnId);
        });
    };

    return (
        <>
            {isDraggable && (
                <DraggableColumnReorderingButton component="div" disableRipple>
                    <DragIndicator />
                </DraggableColumnReorderingButton>
            )}
            <RowActionsMenu>
                <RowActionsMenu
                    componentsProps={{
                        rowActionsIconItem: {
                            componentsProps: {
                                iconButton: {
                                    "aria-label": intl.formatMessage({
                                        id: "dextinity.tableBlock.openColumnOptions",
                                        defaultMessage: "Open column options",
                                    }),
                                },
                            },
                        },
                    }}
                >
                    <TableSettingsMenuItems settings={columnSettings} values={settings} onChange={handleSetColumnSetting} />
                    {hasTableSettings(columnSettings) && <Divider />}
                    <RowActionsItem
                        icon={<ColumnInsertLeft />}
                        onClick={() => {
                            handleInsertColumnAtIndex(columnIndex);
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.insertColumnLeft" defaultMessage="Insert column left" />
                    </RowActionsItem>
                    <RowActionsItem
                        icon={<ColumnInsertRight />}
                        onClick={() => {
                            handleInsertColumnAtIndex(columnIndex + 1);
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.insertColumnRight" defaultMessage="Insert column right" />
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem
                        icon={<ColumnMoveLeft />}
                        disabled={isFirstColumn}
                        onClick={() => {
                            handleMoveColumn("left");
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.moveColumnLeft" defaultMessage="Move left" />
                    </RowActionsItem>
                    <RowActionsItem
                        icon={<ColumnMoveRight />}
                        disabled={isLastColumn}
                        onClick={() => {
                            handleMoveColumn("right");
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.moveColumnRight" defaultMessage="Move right" />
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem icon={<Copy />} onClick={handleCopyColumnToClipboard}>
                        <FormattedMessage id="dextinity.tableBlock.copyColumn" defaultMessage="Copy" />
                    </RowActionsItem>
                    <RowActionsItem icon={<Paste />} onClick={pasteColumnFromClipboard}>
                        <FormattedMessage id="dextinity.tableBlock.pasteColumn" defaultMessage="Paste" />
                    </RowActionsItem>
                    <RowActionsItem icon={<Duplicate />} onClick={handleDuplicateColumn}>
                        <FormattedMessage id="dextinity.tableBlock.duplicateColumn" defaultMessage="Duplicate" />
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem icon={<Delete />} onClick={handleDeleteColumn}>
                        <FormattedMessage id="dextinity.tableBlock.deleteColumn" defaultMessage="Delete" />
                    </RowActionsItem>
                </RowActionsMenu>
            </RowActionsMenu>
        </>
    );
};

// The first element of type "button" inside the ColumnHeader will automatically be used for column reordering
const DraggableColumnReorderingButton = styled(ButtonBase)(({ theme }) => ({
    position: "absolute",
    inset: 0,
    cursor: "move",
    justifyContent: "flex-start",
    paddingLeft: theme.spacing(2),
})) as typeof ButtonBase;
