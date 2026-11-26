import { SelectField } from "@dextinity/admin";
import { Box } from "@mui/material";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useBlocksConfig } from "../config/BlocksConfigContext";
import {
    createOneOfBlock,
    type OneOfBlockFragment,
    type OneOfBlockOutput,
    type OneOfBlockPreviewState,
    type OneOfBlockState,
} from "../factories/createOneOfBlock";
import { BlocksFinalForm } from "../form/BlocksFinalForm";
import type { BlockInterface, BlockState, ReadOnlyBlockRenderInterface } from "../types";
import { resolveNewState } from "../utils";

export type TableCellBlockInterface = BlockInterface & ReadOnlyBlockRenderInterface;

export type TableCellOneOfBlock = BlockInterface<OneOfBlockFragment, OneOfBlockState, OneOfBlockOutput<false>, OneOfBlockPreviewState> &
    ReadOnlyBlockRenderInterface<OneOfBlockState>;

export type TableCellConversions<CellBlocks extends Record<string, TableCellBlockInterface>> = {
    [From in keyof CellBlocks]?: {
        [To in keyof CellBlocks]?: (state: BlockState<CellBlocks[From]>) => BlockState<CellBlocks[To]> | null;
    };
};

type Options = {
    name: string;
    cellBlocks: Record<string, TableCellBlockInterface>;
    convertCell?: TableCellConversions<Record<string, TableCellBlockInterface>>;
};

export const createTableCellBlock = ({ name, cellBlocks, convertCell }: Options): TableCellOneOfBlock => {
    const getCellBlock = (type: string) => {
        const block = cellBlocks[type];
        if (!block) {
            throw new Error(`No cell block found for type "${type}"`);
        }
        return block;
    };

    const getActiveItem = (state: OneOfBlockState) => {
        const activeItem = state.attachedBlocks.find((item) => item.type === state.activeType);
        if (!activeItem) {
            throw new Error(`activeType "${state.activeType}" has no entry in attachedBlocks`);
        }
        return activeItem;
    };

    const switchType = (state: OneOfBlockState, type: string): OneOfBlockState => {
        const activeItem = getActiveItem(state);
        const previousItem = state.attachedBlocks.find((item) => item.type === type);
        const props: BlockState<TableCellBlockInterface> =
            convertCell?.[activeItem.type]?.[type]?.(activeItem.props) ?? previousItem?.props ?? getCellBlock(type).defaultValues();

        return {
            ...state,
            attachedBlocks: previousItem
                ? state.attachedBlocks.map((item) => (item.type === type ? { ...item, props } : item))
                : [...state.attachedBlocks, { type, props }],
            activeType: type,
        };
    };

    const OneOfBlock = createOneOfBlock({ name, supportedBlocks: cellBlocks, allowEmpty: false });

    return {
        ...OneOfBlock,

        AdminComponent: ({ state, updateState }) => {
            const { scope } = useContentScope();
            const { isBlockSupported } = useBlocksConfig();

            const typeOptions = useMemo(
                () =>
                    Object.entries(cellBlocks)
                        .filter(([, block]) => !isBlockSupported || isBlockSupported(block, scope))
                        .map(([type, block]) => ({ value: type, label: block.displayName })),
                [isBlockSupported, scope],
            );

            const activeItem = getActiveItem(state);
            const ActiveBlock = getCellBlock(activeItem.type);

            const updateActiveBlockState: Dispatch<SetStateAction<unknown>> = (setStateAction) => {
                updateState((prevState) => ({
                    ...prevState,
                    attachedBlocks: prevState.attachedBlocks.map((item) =>
                        item.type === activeItem.type ? { ...item, props: resolveNewState({ prevState: item.props, setStateAction }) } : item,
                    ),
                }));
            };

            return (
                <>
                    {typeOptions.length > 1 && (
                        <Box sx={{ padding: 2 }}>
                            <BlocksFinalForm<{ type: string }>
                                onSubmit={({ type }) => updateState((prevState) => switchType(prevState, type))}
                                initialValues={{ type: activeItem.type }}
                            >
                                <SelectField
                                    name="type"
                                    label={<FormattedMessage id="dextinity.tableBlock.cellType" defaultMessage="Type" />}
                                    options={typeOptions}
                                    fullWidth
                                    required
                                />
                            </BlocksFinalForm>
                        </Box>
                    )}
                    <ActiveBlock.AdminComponent key={activeItem.type} state={activeItem.props} updateState={updateActiveBlockState} />
                </>
            );
        },

        ReadOnlyComponent: ({ state }) => {
            const activeItem = getActiveItem(state);
            const ActiveBlock = getCellBlock(activeItem.type);

            return <ActiveBlock.ReadOnlyComponent state={activeItem.props} />;
        },
    };
};
