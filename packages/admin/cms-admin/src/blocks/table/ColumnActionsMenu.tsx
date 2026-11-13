import { writeClipboardText } from "@dextinity/admin";
import { Icon, IconButton, Menu, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSubmenu } from "@dextinity/ui";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import type { TableBlockData } from "../../blocks.generated";
import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import { useTableBlockContext } from "./TableBlockContext";
import { useTableBlockMessages } from "./tableBlockMessages";
import {
    columnInsertSchema,
    getDuplicatedColumnInsertData,
    getInsertDataFromColumnById,
    insertColumnDataAtIndex,
    moveColumnToIndex,
    removeColumnFromState,
    setColumnSize,
    toggleColumnHighlight,
} from "./utils/column";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";

type ColumnSize = TableBlockData["columns"][number]["size"];

const columnSizes: ColumnSize[] = ["extraSmall", "small", "standard", "large", "extraLarge"];

const isColumnSize = (value: string): value is ColumnSize => (columnSizes as string[]).includes(value);

type Props = {
    columnId: string;
    columnIndex: number;
    columnSize: ColumnSize;
    highlighted: boolean;
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    addToRecentlyPastedIds: (id: string) => void;
    showError: (message: string) => void;
};

export const ColumnActionsMenu = ({
    columnId,
    columnIndex,
    columnSize,
    highlighted,
    state,
    updateState,
    addToRecentlyPastedIds,
    showError,
}: Props) => {
    const intl = useIntl();
    const blockContext = useBlockContext();
    const { RichTextBlock } = useTableBlockContext();
    const tableBlockMessages = useTableBlockMessages();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isColumnWidthMenuOpen, setIsColumnWidthMenuOpen] = useState(false);
    const isFirstColumn = columnIndex === 0;
    const isLastColumn = columnIndex === state.columns.length - 1;

    const columnSizeLabels: Record<ColumnSize, string> = {
        extraSmall: intl.formatMessage({ id: "dextinity.tableBlock.columnSize.extraSmall", defaultMessage: "Extra small" }),
        small: intl.formatMessage({ id: "dextinity.tableBlock.columnSize.small", defaultMessage: "Small" }),
        standard: intl.formatMessage({ id: "dextinity.tableBlock.columnSize.standard", defaultMessage: "Standard" }),
        large: intl.formatMessage({ id: "dextinity.tableBlock.columnSize.large", defaultMessage: "Large" }),
        extraLarge: intl.formatMessage({ id: "dextinity.tableBlock.columnSize.extraLarge", defaultMessage: "Extra large" }),
    };

    const insertColumnAtIndex = (newColumnIndex: number) => {
        updateState((state) =>
            insertColumnDataAtIndex(
                state,
                { size: "standard", highlighted: false, cellValues: state.rows.map(() => RichTextBlock.defaultValues()) },
                newColumnIndex,
                RichTextBlock,
            ),
        );
    };

    const moveColumn = (direction: "left" | "right") => {
        updateState((state) => {
            const currentColumnIndex = state.columns.findIndex(({ id }) => id === columnId);
            return moveColumnToIndex({ state, columnId, targetIndex: direction === "left" ? currentColumnIndex - 1 : currentColumnIndex + 1 });
        });
    };

    const duplicateColumn = () => {
        const duplicatedColumnInsertData = getDuplicatedColumnInsertData(state, columnIndex, RichTextBlock);
        if (!duplicatedColumnInsertData) {
            showError(intl.formatMessage({ id: "dextinity.tableBlock.failedToDuplicateColumn", defaultMessage: "Failed to duplicate column" }));
            return;
        }

        const newColumnId = uuid();
        addToRecentlyPastedIds(newColumnId);
        updateState((state) => insertColumnDataAtIndex(state, duplicatedColumnInsertData, columnIndex + 1, RichTextBlock, newColumnId));
    };

    const copyColumnToClipboard = () => {
        const columnInsertData = getInsertDataFromColumnById(state, columnId, RichTextBlock);
        if (!columnInsertData) {
            showError(intl.formatMessage({ id: "dextinity.tableBlock.failedToCopyColumn", defaultMessage: "Failed to copy column" }));
            return;
        }

        writeClipboardText(JSON.stringify(columnInsertData));
    };

    const pasteColumnFromClipboard = async () => {
        const clipboardData = await getClipboardValueForSchema(columnInsertSchema);
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

        const newColumnId = uuid();
        addToRecentlyPastedIds(newColumnId);
        updateState((state) =>
            insertColumnDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, columnIndex + 1, RichTextBlock, newColumnId),
        );
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
                    aria-label={intl.formatMessage({ id: "dextinity.tableBlock.openColumnOptions", defaultMessage: "Open column options" })}
                >
                    <Icon name="more-vertical" />
                </IconButton>
            }
        >
            <MenuSubmenu
                label={intl.formatMessage({ id: "dextinity.tableBlock.columnWidth", defaultMessage: "Column width" })}
                icon={<Icon name="density-standard" />}
                open={isColumnWidthMenuOpen}
                onOpenChange={setIsColumnWidthMenuOpen}
            >
                <MenuRadioGroup
                    value={columnSize}
                    onChange={(size) => {
                        if (isColumnSize(size)) {
                            updateState((state) => setColumnSize(state, columnId, size));
                        }
                    }}
                >
                    {columnSizes.map((size) => (
                        <MenuRadioItem key={size} value={size} label={columnSizeLabels[size]} />
                    ))}
                </MenuRadioGroup>
            </MenuSubmenu>
            <MenuItem
                label={
                    highlighted
                        ? tableBlockMessages.removeHighlighting
                        : intl.formatMessage({ id: "dextinity.tableBlock.highlightColumn", defaultMessage: "Highlight column" })
                }
                icon={<Icon name={highlighted ? "minus-circle" : "highlight"} />}
                onClick={() => updateState((state) => toggleColumnHighlight(state, columnId))}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.insertColumnLeft", defaultMessage: "Insert column left" })}
                icon={<Icon name="plus-circle" />}
                onClick={() => insertColumnAtIndex(columnIndex)}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.insertColumnRight", defaultMessage: "Insert column right" })}
                icon={<Icon name="plus-circle" />}
                onClick={() => insertColumnAtIndex(columnIndex + 1)}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.moveColumnLeft", defaultMessage: "Move left" })}
                icon={<Icon name="arrow-left" />}
                disabled={isFirstColumn}
                onClick={() => moveColumn("left")}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.moveColumnRight", defaultMessage: "Move right" })}
                icon={<Icon name="arrow-right" />}
                disabled={isLastColumn}
                onClick={() => moveColumn("right")}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.copyColumn", defaultMessage: "Copy" })}
                icon={<Icon name="copy" />}
                onClick={copyColumnToClipboard}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.pasteColumn", defaultMessage: "Paste" })}
                icon={<Icon name="paste-add" />}
                onClick={pasteColumnFromClipboard}
            />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.duplicateColumn", defaultMessage: "Duplicate" })}
                icon={<Icon name="duplicate" />}
                onClick={duplicateColumn}
            />
            <MenuSeparator />
            <MenuItem
                label={intl.formatMessage({ id: "dextinity.tableBlock.deleteColumn", defaultMessage: "Delete" })}
                icon={<Icon name="trash" />}
                color="error"
                onClick={() => updateState((state) => removeColumnFromState(state, columnId))}
            />
        </Menu>
    );
};
