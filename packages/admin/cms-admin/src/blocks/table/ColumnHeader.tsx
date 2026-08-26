import { Alert, RowActionsItem, RowActionsMenu, useSnackbarApi, writeClipboardText } from "@dextinity/admin";
import { Add, Copy, Delete, DensityStandard, DragIndicator, Duplicate, Paste, PinLeft, PinRight, Remove } from "@dextinity/admin-icons";
import { ButtonBase, Divider, Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { GridColumnHeaderParams } from "@mui/x-data-grid";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import type { TableBlockData } from "../../blocks.generated";
import { useBlockContext } from "../context/useBlockContext";
import type { TableBlockState } from "../createTableBlock";
import { FailedToPasteSnackbar } from "./FailedToPasteSnackbar";
import { useTableBlockContext } from "./TableBlockContext";
import {
    columnInsertSchema,
    getDuplicatedColumnInsertData,
    getInsertDataFromColumnById,
    insertColumnDataAtIndex,
    removeColumnFromState,
    setColumnSize,
    toggleColumnHighlight,
} from "./utils/column";
import { getClipboardValueForSchema } from "./utils/getClipboardValueForSchema";

type ColumnSize = TableBlockData["columns"][number]["size"];

type Props = GridColumnHeaderParams & {
    columnSize: ColumnSize;
    highlighted: boolean;
    state: TableBlockState;
    updateState: Dispatch<SetStateAction<TableBlockState>>;
    columnIndex: number;
    addToRecentlyPastedIds: (id: string) => void;
};

const columnSizes: Record<ColumnSize, ReactNode> = {
    extraSmall: <FormattedMessage id="dextinity.tableBlock.columnSize.extraSmall" defaultMessage="Extra small" />,
    small: <FormattedMessage id="dextinity.tableBlock.columnSize.small" defaultMessage="Small" />,
    standard: <FormattedMessage id="dextinity.tableBlock.columnSize.standard" defaultMessage="Standard" />,
    large: <FormattedMessage id="dextinity.tableBlock.columnSize.large" defaultMessage="Large" />,
    extraLarge: <FormattedMessage id="dextinity.tableBlock.columnSize.extraLarge" defaultMessage="Extra large" />,
};

export const ColumnHeader = ({ columnSize, highlighted, state, updateState, columnIndex, field: columnId, addToRecentlyPastedIds }: Props) => {
    const snackbarApi = useSnackbarApi();
    const blockContext = useBlockContext();
    const intl = useIntl();
    const { RichTextBlock } = useTableBlockContext();

    const handleInsertColumnAtIndex = (newColumnIndex: number) => {
        updateState((state) => {
            const newColumnInsertData = {
                size: "standard" as const,
                highlighted: false,
                cellValues: state.rows.map(() => RichTextBlock.defaultValues()),
            };
            return insertColumnDataAtIndex(state, newColumnInsertData, newColumnIndex, RichTextBlock);
        });
    };

    const handleDeleteColumn = () => {
        updateState((state) => {
            return removeColumnFromState(state, columnId);
        });
    };

    const handleToggleColumnHighlight = () => {
        updateState((state) => {
            return toggleColumnHighlight(state, columnId);
        });
    };

    const handleSetColumnSize = (size: ColumnSize) => {
        updateState((state) => {
            return setColumnSize(state, columnId, size);
        });
    };

    const handleDuplicateColumn = () => {
        updateState((state) => {
            const duplicatedColumnInsertData = getDuplicatedColumnInsertData(state, columnIndex, RichTextBlock);
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
            return insertColumnDataAtIndex(state, duplicatedColumnInsertData, columnIndex + 1, RichTextBlock, newColumnId);
        });
    };

    const handleCopyColumnToClipboard = () => {
        const columnInsertData = getInsertDataFromColumnById(state, columnId, RichTextBlock);
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
            cellValuesToInsert = await Promise.all(clipboardData.cellValues.map((cellValue) => RichTextBlock.output2State(cellValue, blockContext)));
        } catch (error) {
            console.error(error);
            snackbarApi.showSnackbar(<FailedToPasteSnackbar />);
        }

        updateState((state) => {
            const newColumnId = uuid();
            addToRecentlyPastedIds(newColumnId);
            return insertColumnDataAtIndex(state, { ...clipboardData, cellValues: cellValuesToInsert }, columnIndex + 1, RichTextBlock, newColumnId);
        });
    };

    return (
        <>
            <DraggableColumnReorderingButton component="div" disableRipple>
                <DragIndicator />
            </DraggableColumnReorderingButton>
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
                    <RowActionsMenu
                        text={<FormattedMessage id="dextinity.tableBlock.columnWidth" defaultMessage="Column width" />}
                        icon={<DensityStandard />}
                    >
                        {Object.entries(columnSizes).map(([size, label]) => (
                            <RowActionsItem
                                key={size}
                                onClick={() => {
                                    handleSetColumnSize(size as ColumnSize);
                                }}
                                componentsProps={{ menuItem: { selected: columnSize === size } }}
                            >
                                {label}
                            </RowActionsItem>
                        ))}
                    </RowActionsMenu>
                    <RowActionsItem icon={highlighted ? <Remove /> : <Add />} onClick={handleToggleColumnHighlight}>
                        {highlighted ? (
                            <FormattedMessage id="dextinity.tableBlock.removeHighlighting" defaultMessage="Remove highlighting" />
                        ) : (
                            <FormattedMessage id="dextinity.tableBlock.highlightColumn" defaultMessage="Highlight column" />
                        )}
                    </RowActionsItem>
                    <Divider />
                    <RowActionsItem
                        icon={<PinLeft />}
                        onClick={() => {
                            handleInsertColumnAtIndex(columnIndex);
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.insertColumnLeft" defaultMessage="Insert column left" />
                    </RowActionsItem>
                    <RowActionsItem
                        icon={<PinRight />}
                        onClick={() => {
                            handleInsertColumnAtIndex(columnIndex + 1);
                        }}
                    >
                        <FormattedMessage id="dextinity.tableBlock.insertColumnRight" defaultMessage="Insert column right" />
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
