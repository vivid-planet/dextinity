import { writeClipboardText } from "@dextinity/admin";
import { Icon, IconButton, Menu, MenuItem, MenuSeparator } from "@dextinity/ui";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import { useTableBlockContext } from "./TableBlockContext";
import { useTableBlockMessages } from "./tableBlockMessages";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";
import {
    deleteRowById,
    getDuplicatedRowInsertData,
    getInsertDataFromRowById,
    insertRowDataAtIndex,
    moveRowToIndex,
    rowInsertSchema,
} from "./utils/row";

type Props = {
    rowId: string;
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    addToRecentlyPastedIds: (id: string) => void;
    showError: (message: string) => void;
};

export const RowActionsMenu = ({ rowId, state, updateState, addToRecentlyPastedIds, showError }: Props) => {
    const intl = useIntl();
    const blockContext = useBlockContext();
    const { RichTextBlock } = useTableBlockContext();
    const tableBlockMessages = useTableBlockMessages();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const rowIndex = state.rows.findIndex(({ id }) => id === rowId);
    const highlighted = state.rows[rowIndex]?.highlighted ?? false;
    const isFirstRow = rowIndex === 0;
    const isLastRow = rowIndex === state.rows.length - 1;

    const insertNewRow = (where: "above" | "below") => {
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === rowId);
            return insertRowDataAtIndex(
                state,
                { highlighted: false, cellValues: state.columns.map(() => RichTextBlock.defaultValues()) },
                where === "above" ? currentRowIndex : currentRowIndex + 1,
                RichTextBlock,
            );
        });
    };

    const moveRow = (direction: "up" | "down") => {
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === rowId);
            return moveRowToIndex({ state, rowId, targetIndex: direction === "up" ? currentRowIndex - 1 : currentRowIndex + 1 });
        });
    };

    const toggleRowHighlight = () => {
        updateState((state) => ({
            ...state,
            rows: state.rows.map((row) => (row.id === rowId ? { ...row, highlighted: !row.highlighted } : row)),
        }));
    };

    const duplicateRow = () => {
        const duplicatedRowInsertData = getDuplicatedRowInsertData(state, rowId, RichTextBlock);
        if (!duplicatedRowInsertData) {
            showError(intl.formatMessage({ id: "dextinity.tableBlock.failedToDuplicateRow", defaultMessage: "Failed to duplicate row" }));
            return;
        }

        const newRowId = uuid();
        addToRecentlyPastedIds(newRowId);
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === rowId);
            return insertRowDataAtIndex(state, duplicatedRowInsertData, currentRowIndex + 1, RichTextBlock, newRowId);
        });
    };

    const copyRowToClipboard = () => {
        const rowInsertData = getInsertDataFromRowById(state, rowId, RichTextBlock);
        if (!rowInsertData) {
            showError(intl.formatMessage({ id: "dextinity.tableBlock.failedToCopyRow", defaultMessage: "Failed to copy row" }));
            return;
        }

        writeClipboardText(JSON.stringify(rowInsertData));
    };

    const pasteRowFromClipboard = async () => {
        const clipboardData = await getClipboardValueForSchema(rowInsertSchema);
        if (!clipboardData) {
            showError(tableBlockMessages.failedToPaste);
            return;
        }

        let cellValuesToInsert: unknown[];
        try {
            cellValuesToInsert = await Promise.all(clipboardData.cellValues.map((cellValue) => RichTextBlock.output2State(cellValue, blockContext)));
        } catch (error) {
            console.error(error);
            showError(tableBlockMessages.failedToPaste);
            return;
        }

        const newRowId = uuid();
        addToRecentlyPastedIds(newRowId);
        updateState((state) => {
            const currentRowIndex = state.rows.findIndex(({ id }) => id === rowId);
            return insertRowDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, currentRowIndex + 1, RichTextBlock, newRowId);
        });
    };

    return (
        <Menu
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            placement="bottom-end"
            trigger={
                <IconButton
                    variant="text"
                    color="secondary"
                    size="small"
                    aria-label={intl.formatMessage({ id: "dextinity.tableBlock.openRowOptions", defaultMessage: "Open row options" })}
                >
                    <Icon name="more-vertical" />
                </IconButton>
            }
        >
            <MenuItem
                label={
                    highlighted
                        ? tableBlockMessages.removeHighlighting
                        : intl.formatMessage({ id: "dextinity.tableBlock.highlightRow", defaultMessage: "Highlight row" })
                }
                icon={<Icon name={highlighted ? "minus-circle" : "highlight"} />}
                onClick={toggleRowHighlight}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.addRowAbove", defaultMessage: "Add row above" })}
                icon={<Icon name="plus-circle" />}
                onClick={() => insertNewRow("above")}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.addRowBelow", defaultMessage: "Add row below" })}
                icon={<Icon name="plus-circle" />}
                onClick={() => insertNewRow("below")}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.moveRowUp", defaultMessage: "Move up" })}
                icon={<Icon name="arrow-up" />}
                disabled={isFirstRow}
                onClick={() => moveRow("up")}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.moveRowDown", defaultMessage: "Move down" })}
                icon={<Icon name="arrow-down" />}
                disabled={isLastRow}
                onClick={() => moveRow("down")}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.copyRow", defaultMessage: "Copy" })}
                icon={<Icon name="copy" />}
                onClick={copyRowToClipboard}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.pasteRow", defaultMessage: "Paste" })}
                icon={<Icon name="paste-add" />}
                onClick={pasteRowFromClipboard}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.duplicateRow", defaultMessage: "Duplicate" })}
                icon={<Icon name="duplicate" />}
                onClick={duplicateRow}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.deleteRow", defaultMessage: "Delete" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={() => updateState((state) => deleteRowById(state, rowId))}
            />
        </Menu>
    );
};
