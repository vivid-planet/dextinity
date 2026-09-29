import { CancelButton, DeleteButton, OkayButton } from "@dextinity/admin";
// eslint-disable-next-line no-restricted-imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import { type MouseEvent, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { BlockInterface, BlockState } from "../types";

interface TipTapBlockDialogProps {
    block: BlockInterface;
    initialState: BlockState<BlockInterface>;
    isEditing: boolean;
    onSubmit: (state: BlockState<BlockInterface>) => void;
    onRemove?: () => void;
    onClose: () => void;
}

export function TipTapBlockDialog({ block: Block, initialState, isEditing, onSubmit, onRemove, onClose }: TipTapBlockDialogProps) {
    const [state, setState] = useState<BlockState<BlockInterface>>(initialState);

    const handleRemove = (e: MouseEvent) => {
        e.preventDefault();
        onRemove?.();
        onClose();
    };

    const handleUpdate = (e: MouseEvent) => {
        e.preventDefault();
        onSubmit(state);
        onClose();
    };

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>
                {isEditing ? (
                    <FormattedMessage
                        id="dextinity.blocks.tipTapRichText.editBlock"
                        defaultMessage='Edit "{block}"'
                        values={{ block: Block.displayName }}
                    />
                ) : (
                    <FormattedMessage
                        id="dextinity.blocks.tipTapRichText.insertBlock"
                        defaultMessage='Insert "{block}"'
                        values={{ block: Block.displayName }}
                    />
                )}
            </DialogTitle>
            <DialogContent>
                <Block.AdminComponent state={state} updateState={setState} />
            </DialogContent>
            <StyledDialogActions>
                <CancelButton onClick={onClose} />
                <ButtonContainer>
                    {isEditing && onRemove && (
                        <DeleteButton onClick={handleRemove}>
                            <FormattedMessage id="dextinity.blocks.tipTapRichText.removeBlock" defaultMessage="Delete block" />
                        </DeleteButton>
                    )}
                    <OkayButton onClick={handleUpdate} />
                </ButtonContainer>
            </StyledDialogActions>
        </Dialog>
    );
}

const StyledDialogActions = styled(DialogActions)`
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 10px;

    ${({ theme }) => theme.breakpoints.up("md")} {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 0;
    }
`;

const ButtonContainer = styled("div")`
    display: contents;

    ${({ theme }) => theme.breakpoints.up("md")} {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
`;
