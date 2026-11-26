import { Dialog, OkayButton, useStackApi } from "@dextinity/admin";
import { DialogActions } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router";
import { v4 as uuid } from "uuid";

import type { BlockContext } from "./context/BlockContext";
import type { RichTextBlock } from "./createRichTextBlock";
import type { OneOfBlockState } from "./factories/createOneOfBlock";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import {
    createTableCellBlock,
    type TableCellBlockInterface,
    type TableCellConversions,
    type TableCellOneOfBlock,
} from "./table/createTableCellBlock";
import {
    createTableSettingsState,
    type TableCellSettings,
    type TableColumnWidth,
    type TableSettingsDeclaration,
    type TableSettingsState,
} from "./table/createTableSettings";
import { defaultTableColumnSettings, defaultTableRowSettings } from "./table/defaultTableSettings";
import { TableBlockContextProvider } from "./table/TableBlockContext";
import { TableBlockGrid } from "./table/TableBlockGrid";
import { createCellRoute, parseCellHash } from "./table/utils/cellRoute";
import { createTablePreviewText, getPlainTexts } from "./table/utils/createTablePreviewText";
import { BlockCategory, type BlockInputApi, type BlockInterface, type BlockOutputApi, type BlockPreviewContext, type BlockState } from "./types";

type TableSettingsFactoryOptions = {
    /** Declared with `createTableSettings`. Defaults to `defaultTableRowSettings`. */
    rowSettings?: TableSettingsDeclaration;
    /** Declared with `createTableSettings`. Defaults to `defaultTableColumnSettings`. */
    columnSettings?: TableSettingsDeclaration;
    /**
     * Styles a cell in the admin grid depending on the settings of its row and column, e.g. with a background.
     * Defaults to `getHighlightedTableCellStyle`, which gives the cells of a highlighted row or column a background.
     */
    getCellStyle?: (cell: TableCellSettings) => SxProps<Theme>;
    /**
     * The width of a column in the admin grid depending on its settings.
     * Defaults to the width of the column's `size` setting.
     */
    getColumnWidth?: (columnSettings: TableSettingsState) => TableColumnWidth;
};

type RichTextTableBlockFactoryOptions<RichText extends TableCellBlockInterface> = TableSettingsFactoryOptions & {
    richText: RichText;
    cellBlocks?: never;
    convertCell?: never;
    name?: string;
};

type CellBlocksTableBlockFactoryOptions<CellBlocks extends Record<string, TableCellBlockInterface>> = TableSettingsFactoryOptions & {
    /**
     * The first block is the default for new cells.
     */
    cellBlocks: CellBlocks;
    /**
     * Converts a cell's content when its type changes, e.g. `{ text: { price: (textState) => priceState } }`.
     * Return `null` when the content can't be converted.
     * A conversion takes precedence over the content the cell had in the new type before.
     */
    convertCell?: TableCellConversions<NoInfer<CellBlocks>>;
    richText?: never;
    name?: string;
};

export type TableBlockFactoryOptions<
    RichText extends TableCellBlockInterface = RichTextBlock,
    CellBlocks extends Record<string, TableCellBlockInterface> = Record<string, TableCellBlockInterface>,
> = RichTextTableBlockFactoryOptions<RichText> | CellBlocksTableBlockFactoryOptions<CellBlocks>;

interface TableBlockCellValueState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CellState = any,
> {
    columnId: string;
    value: CellState;
}

export interface TableBlockRowState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CellState = any,
> {
    id: string;
    settings: TableSettingsState;
    cellValues: TableBlockCellValueState<CellState>[];
}

export interface TableBlockColumnState {
    id: string;
    settings: TableSettingsState;
}

export interface TableBlockState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CellState = any,
> {
    columns: TableBlockColumnState[];
    rows: TableBlockRowState<CellState>[];
}

interface TableBlockCellValue<Value> {
    columnId: string;
    value: Value;
}

interface TableBlockColumn {
    id: string;
    settings?: TableSettingsState;
}

interface TableBlockRow<Value> {
    id: string;
    settings?: TableSettingsState;
    cellValues: TableBlockCellValue<Value>[];
}

interface TableBlockCells<Value> {
    columns: TableBlockColumn[];
    rows: TableBlockRow<Value>[];
}

type TableBlock<CellBlock extends TableCellBlockInterface> = BlockInterface<
    TableBlockCells<BlockInputApi<CellBlock>>,
    TableBlockState<BlockState<CellBlock>>,
    TableBlockCells<BlockOutputApi<CellBlock>>
>;

// Comes first, otherwise the functions in `convertCell` lose the state types of their cell blocks
export function createTableBlock<CellBlocks extends Record<string, TableCellBlockInterface>>(
    options: CellBlocksTableBlockFactoryOptions<CellBlocks>,
    override?: (block: TableBlock<TableCellOneOfBlock>) => TableBlock<TableCellOneOfBlock>,
): TableBlock<TableCellOneOfBlock>;
export function createTableBlock<RichText extends TableCellBlockInterface = RichTextBlock>(
    options: RichTextTableBlockFactoryOptions<RichText>,
    override?: (block: TableBlock<RichText>) => TableBlock<RichText>,
): TableBlock<RichText>;
export function createTableBlock(
    {
        richText,
        cellBlocks,
        convertCell,
        rowSettings = defaultTableRowSettings,
        columnSettings = defaultTableColumnSettings,
        getCellStyle,
        getColumnWidth,
        name = "Table",
    }: TableBlockFactoryOptions<TableCellBlockInterface>,
    override?: (block: TableBlock<TableCellBlockInterface>) => TableBlock<TableCellBlockInterface>,
): TableBlock<TableCellBlockInterface> {
    type CellState = BlockState<TableCellBlockInterface>;

    const CellBlock: TableCellBlockInterface = cellBlocks ? createTableCellBlock({ name: `${name}Cell`, cellBlocks, convertCell }) : richText;

    const createCellPreviewState = (cellState: CellState, cellRoute: string, previewCtx: BlockPreviewContext & BlockContext) => {
        if (!cellBlocks) {
            return { ...CellBlock.createPreviewState(cellState, previewCtx), adminMeta: { route: cellRoute } };
        }

        // The one-of's own preview state would link the active block to `${parentUrl}#${type}`, which isn't a cell route
        const { attachedBlocks, activeType } = cellState as OneOfBlockState;
        const activeItem = attachedBlocks.find((item) => item.type === activeType);
        const cellPreviewCtx = { ...previewCtx, parentUrlSubRoute: undefined, parentUrl: cellRoute };

        return {
            block: activeItem
                ? {
                      type: activeItem.type,
                      props: { ...cellBlocks[activeItem.type].createPreviewState(activeItem.props, cellPreviewCtx), adminMeta: { route: cellRoute } },
                  }
                : undefined,
            adminMeta: { route: cellRoute },
        };
    };

    const getInitialTableState = (): TableBlockState<CellState> => {
        const columnIdOne = uuid();
        const columnIdTwo = uuid();

        return {
            columns: [
                { id: columnIdOne, settings: createTableSettingsState(columnSettings) },
                { id: columnIdTwo, settings: createTableSettingsState(columnSettings) },
            ],
            rows: [
                {
                    id: uuid(),
                    settings: createTableSettingsState(rowSettings),
                    cellValues: [
                        { columnId: columnIdOne, value: CellBlock.defaultValues() },
                        { columnId: columnIdTwo, value: CellBlock.defaultValues() },
                    ],
                },
                {
                    id: uuid(),
                    settings: createTableSettingsState(rowSettings),
                    cellValues: [
                        { columnId: columnIdOne, value: CellBlock.defaultValues() },
                        { columnId: columnIdTwo, value: CellBlock.defaultValues() },
                    ],
                },
            ],
        };
    };

    const TableBlock: TableBlock<TableCellBlockInterface> = {
        ...createBlockSkeleton(),

        name,
        displayName: <FormattedMessage id="dextinity.blocks.table.displayName" defaultMessage="Table" />,
        category: BlockCategory.TextAndContent,

        defaultValues: getInitialTableState,

        input2State: (input: TableBlockCells<BlockInputApi<TableCellBlockInterface>>): TableBlockState<CellState> => ({
            columns: input.columns.map(({ id, settings }) => ({ id, settings: createTableSettingsState(columnSettings, settings) })),
            rows: input.rows.map(({ id, settings, cellValues }) => ({
                id,
                settings: createTableSettingsState(rowSettings, settings),
                cellValues: cellValues.map((cell) => ({
                    ...cell,
                    value: CellBlock.input2State(cell.value),
                })),
            })),
        }),

        state2Output: (state: TableBlockState<CellState>): TableBlockCells<BlockOutputApi<TableCellBlockInterface>> => ({
            columns: state.columns,
            rows: state.rows.map((row) => ({
                ...row,
                cellValues: row.cellValues.map((cell) => ({
                    ...cell,
                    value: CellBlock.state2Output(cell.value),
                })),
            })),
        }),

        output2State: async (
            output: TableBlockCells<BlockOutputApi<TableCellBlockInterface>>,
            context: BlockContext,
        ): Promise<TableBlockState<CellState>> => ({
            columns: output.columns.map(({ id, settings }) => ({ id, settings: createTableSettingsState(columnSettings, settings) })),
            rows: await Promise.all(
                output.rows.map(async ({ id, settings, cellValues }) => ({
                    id,
                    settings: createTableSettingsState(rowSettings, settings),
                    cellValues: await Promise.all(
                        cellValues.map(async (cell) => ({
                            ...cell,
                            value: await CellBlock.output2State(cell.value, context),
                        })),
                    ),
                })),
            ),
        }),

        createPreviewState: (state: TableBlockState<CellState>, previewCtx: BlockPreviewContext & BlockContext) => ({
            columns: state.columns,
            rows: state.rows.map((row) => ({
                ...row,
                cellValues: row.cellValues.map((cell) => ({
                    ...cell,
                    value: createCellPreviewState(
                        cell.value,
                        createCellRoute(previewCtx.parentUrl, { columnId: cell.columnId, rowId: row.id }),
                        previewCtx,
                    ),
                })),
            })),
            adminMeta: { route: previewCtx.parentUrl },
        }),

        previewContent: (state: TableBlockState<CellState>, context: BlockContext) => {
            const previewText = createTablePreviewText(state, (cellState) => getPlainTexts(CellBlock.previewContent(cellState, context)));

            return previewText.length > 0 ? [{ type: "text", content: previewText }] : [];
        },

        AdminComponent: ({ state, updateState }) => {
            const stackApi = useStackApi();
            const intl = useIntl();
            const [showDialog, setShowDialog] = useState(true);
            const [hasDialogOpened, setHasDialogOpened] = useState(false);
            const location = useLocation();
            const clickedCell = useMemo(() => parseCellHash(location.hash), [location.hash]);

            const handleDialogOpened = () => setHasDialogOpened(true);

            const closeTableBlock = () => {
                setShowDialog(false);
                stackApi?.goBack();
            };

            return (
                <TableBlockContextProvider
                    CellBlock={CellBlock}
                    rowSettings={rowSettings}
                    columnSettings={columnSettings}
                    getCellStyle={getCellStyle}
                    getColumnWidth={getColumnWidth}
                >
                    <SelectPreviewComponent>
                        <BlocksFinalForm<TableBlockState<CellState>> onSubmit={updateState} initialValues={state}>
                            <Dialog
                                open={showDialog}
                                maxWidth="xl"
                                onClose={closeTableBlock}
                                title={intl.formatMessage({ id: "dextinity.blocks.table.displayName", defaultMessage: "Table" })}
                                sx={(theme) => ({ zIndex: theme.zIndex.modal - 2 })}
                                slotProps={{
                                    root: {
                                        slotProps: {
                                            paper: { sx: { height: "100%", maxHeight: 880 } },
                                            transition: { onEntered: handleDialogOpened },
                                        },
                                    },
                                }}
                            >
                                <TableBlockGrid state={state} updateState={updateState} clickedCell={hasDialogOpened ? clickedCell : undefined} />
                                <DialogActions>
                                    <OkayButton onClick={closeTableBlock} />
                                </DialogActions>
                            </Dialog>
                        </BlocksFinalForm>
                    </SelectPreviewComponent>
                </TableBlockContextProvider>
            );
        },
    };

    if (override) {
        return override(TableBlock);
    }

    return TableBlock;
}
