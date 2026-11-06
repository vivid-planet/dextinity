import { useState } from "react";
import { useIntl } from "react-intl";

import { messageText } from "../form/messageText";
import type { BlockInterface, BlockState } from "../types";
import { TipTapDialog } from "./TipTapDialog";

interface TipTapBlockDialogProps {
    block: BlockInterface;
    initialState: BlockState<BlockInterface>;
    isEditing: boolean;
    onSubmit: (state: BlockState<BlockInterface>) => void;
    onRemove?: () => void;
    onClose: () => void;
}

export function TipTapBlockDialog({ block: Block, initialState, isEditing, onSubmit, onRemove, onClose }: TipTapBlockDialogProps) {
    const intl = useIntl();
    const [state, setState] = useState<BlockState<BlockInterface>>(initialState);
    const blockName = messageText(intl, Block.displayName) ?? Block.name;

    return (
        <TipTapDialog
            title={
                isEditing
                    ? intl.formatMessage({ id: "dextinity.blocks.tipTapRichText.editBlock", defaultMessage: 'Edit "{block}"' }, { block: blockName })
                    : intl.formatMessage(
                          { id: "dextinity.blocks.tipTapRichText.insertBlock", defaultMessage: 'Insert "{block}"' },
                          { block: blockName },
                      )
            }
            onSubmit={() => onSubmit(state)}
            onClose={onClose}
            onRemove={isEditing ? onRemove : undefined}
            removeLabel={intl.formatMessage({ id: "dextinity.blocks.tipTapRichText.removeBlock", defaultMessage: "Delete block" })}
        >
            <Block.AdminComponent state={state} updateState={setState} />
        </TipTapDialog>
    );
}
