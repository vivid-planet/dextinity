import { Dialog, OkayButton, useStackApi } from "@dextinity/admin";
import { DialogActions } from "@mui/material";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import type { TableBlockData } from "../blocks.generated";
import type { BlockContext } from "./context/BlockContext";
import type { RichTextBlock } from "./createRichTextBlock";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { TableBlockContextProvider } from "./table/TableBlockContext";
import { TableBlockGrid } from "./table/TableBlockGrid";
import {
    BlockCategory,
    type BlockInputApi,
    type BlockInterface,
    type BlockOutputApi,
    type BlockPreviewContext,
    type BlockState,
    type ReadOnlyBlockRenderInterface,
} from "./types";

type RichTextBlockInterface = BlockInterface & ReadOnlyBlockRenderInterface;

export type TableBlockFactoryOptions<RichText extends RichTextBlockInterface = RichTextBlock> = {
    richText: RichText;
    name?: string;
};

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
    highlighted: boolean;
    cellValues: TableBlockCellValueState<CellState>[];
}

export interface TableBlockState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CellState = any,
> {
    columns: TableBlockData["columns"];
    rows: TableBlockRowState<CellState>[];
}

interface TableBlockCellValue<Value> {
    columnId: string;
    value: Value;
}

interface TableBlockRow<Value> {
    id: string;
    highlighted: boolean;
    cellValues: TableBlockCellValue<Value>[];
}

interface TableBlockCells<Value> {
    columns: TableBlockData["columns"];
    rows: TableBlockRow<Value>[];
}

type TableBlock<RichText extends RichTextBlockInterface> = BlockInterface<
    TableBlockCells<BlockInputApi<RichText>>,
    TableBlockState<BlockState<RichText>>,
    TableBlockCells<BlockOutputApi<RichText>>
>;

export const createTableBlock = <RichText extends RichTextBlockInterface = RichTextBlock>(
    { richText: RichTextBlock, name = "Table" }: TableBlockFactoryOptions<RichText>,
    override?: (block: TableBlock<RichText>) => TableBlock<RichText>,
): TableBlock<RichText> => {
    type CellState = BlockState<RichText>;

    const getInitialTableState = (): TableBlockState<CellState> => {
        const columnIdOne = uuid();
        const columnIdTwo = uuid();

        return {
            columns: [
                { id: columnIdOne, size: "standard", highlighted: false },
                { id: columnIdTwo, size: "standard", highlighted: false },
            ],
            rows: [
                {
                    id: uuid(),
                    highlighted: false,
                    cellValues: [
                        { columnId: columnIdOne, value: RichTextBlock.defaultValues() },
                        { columnId: columnIdTwo, value: RichTextBlock.defaultValues() },
                    ],
                },
                {
                    id: uuid(),
                    highlighted: false,
                    cellValues: [
                        { columnId: columnIdOne, value: RichTextBlock.defaultValues() },
                        { columnId: columnIdTwo, value: RichTextBlock.defaultValues() },
                    ],
                },
            ],
        };
    };

    const TableBlock: TableBlock<RichText> = {
        ...createBlockSkeleton(),

        name,
        displayName: <FormattedMessage id="dextinity.blocks.table.displayName" defaultMessage="Table" />,
        category: BlockCategory.TextAndContent,

        defaultValues: getInitialTableState,

        input2State: (input: TableBlockCells<BlockInputApi<RichText>>): TableBlockState<CellState> => ({
            columns: input.columns,
            rows: input.rows.map((row) => ({
                ...row,
                cellValues: row.cellValues.map((cell) => ({
                    ...cell,
                    value: RichTextBlock.input2State(cell.value),
                })),
            })),
        }),

        state2Output: (state: TableBlockState<CellState>): TableBlockCells<BlockOutputApi<RichText>> => ({
            columns: state.columns,
            rows: state.rows.map((row) => ({
                ...row,
                cellValues: row.cellValues.map((cell) => ({
                    ...cell,
                    value: RichTextBlock.state2Output(cell.value),
                })),
            })),
        }),

        output2State: async (output: TableBlockCells<BlockOutputApi<RichText>>, context: BlockContext): Promise<TableBlockState<CellState>> => ({
            columns: output.columns,
            rows: await Promise.all(
                output.rows.map(async (row) => ({
                    ...row,
                    cellValues: await Promise.all(
                        row.cellValues.map(async (cell) => ({
                            ...cell,
                            value: await RichTextBlock.output2State(cell.value, context),
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
                    value: RichTextBlock.createPreviewState(cell.value, previewCtx),
                })),
            })),
            adminMeta: { route: previewCtx.parentUrl },
        }),

        AdminComponent: ({ state, updateState }) => {
            const stackApi = useStackApi();
            const intl = useIntl();
            const [showDialog, setShowDialog] = useState(true);

            const closeTableBlock = () => {
                setShowDialog(false);
                stackApi?.goBack();
            };

            return (
                <TableBlockContextProvider RichTextBlock={RichTextBlock}>
                    <SelectPreviewComponent>
                        <BlocksFinalForm<TableBlockState<CellState>> onSubmit={updateState} initialValues={state}>
                            <Dialog
                                open={showDialog}
                                maxWidth="xl"
                                onClose={closeTableBlock}
                                title={intl.formatMessage({ id: "dextinity.blocks.table.displayName", defaultMessage: "Table" })}
                                PaperProps={{ sx: { height: "100%", maxHeight: 880 } }}
                                sx={(theme) => ({ zIndex: theme.zIndex.modal - 2 })}
                            >
                                <TableBlockGrid state={state} updateState={updateState} />
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
};
