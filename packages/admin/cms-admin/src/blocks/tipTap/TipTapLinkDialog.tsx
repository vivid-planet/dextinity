import { CancelButton, DeleteButton, OkayButton } from "@dextinity/admin";
// eslint-disable-next-line no-restricted-imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import type { Editor } from "@tiptap/react";
import { type MouseEvent, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { BlockInterface, BlockState, LinkBlockInterface } from "../types";

interface TipTapLinkDialogProps {
    editor: Editor;
    linkBlock: BlockInterface & LinkBlockInterface;
    onClose: () => void;
}

export function TipTapLinkDialog({ editor, linkBlock: LinkBlock, onClose }: TipTapLinkDialogProps) {
    const isEditing = editor.isActive("link");
    const existingLinkData = isEditing ? (editor.getAttributes("link").data as BlockState<typeof LinkBlock> | undefined) : undefined;

    const linkState: BlockState<typeof LinkBlock> = useMemo(() => {
        if (existingLinkData) {
            return existingLinkData;
        }
        return LinkBlock.defaultValues();
    }, [existingLinkData, LinkBlock]);

    const [newLinkState, setNewLinkState] = useState<BlockState<typeof LinkBlock>>(linkState);

    const handleRemove = (e: MouseEvent) => {
        e.preventDefault();
        editor.chain().focus().extendMarkRange("link").unsetCmsLink().run();
        onClose();
    };

    const handleUpdate = (e: MouseEvent) => {
        e.preventDefault();
        if (isEditing) {
            editor.chain().focus().extendMarkRange("link").unsetCmsLink().setCmsLink({ data: newLinkState }).run();
        } else {
            editor.chain().focus().setCmsLink({ data: newLinkState }).run();
        }
        onClose();
    };

    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, "");

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>
                {isEditing ? (
                    <FormattedMessage
                        id="dextinity.blocks.tipTapRichText.editLink"
                        defaultMessage='Edit link "{link}"'
                        values={{ link: selectedText }}
                    />
                ) : (
                    <FormattedMessage id="dextinity.blocks.tipTapRichText.insertLink" defaultMessage="Insert link" />
                )}
            </DialogTitle>
            <DialogContent>
                <LinkBlock.AdminComponent state={newLinkState} updateState={setNewLinkState} />
            </DialogContent>
            <StyledDialogActions>
                <CancelButton onClick={onClose} />
                <ButtonContainer>
                    {isEditing && (
                        <DeleteButton onClick={handleRemove}>
                            <FormattedMessage id="dextinity.blocks.tipTapRichText.removeLink" defaultMessage="Delete Link" />
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
