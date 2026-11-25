// eslint-disable-next-line no-restricted-imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import type { Editor } from "@tiptap/react";
import { type MouseEvent, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import { CancelButton } from "../common/buttons/cancel/CancelButton";
import { DeleteButton } from "../common/buttons/delete/DeleteButton";
import { OkayButton } from "../common/buttons/okay/OkayButton";
import type { TipTapRichTextEditorLink } from "./options";

interface LinkDialogProps {
    editor: Editor;
    link: TipTapRichTextEditorLink;
    onClose: () => void;
}

export function LinkDialog({ editor, link, onClose }: LinkDialogProps) {
    const isEditing = editor.isActive("link");
    const existingLinkData: unknown = isEditing ? editor.getAttributes("link").data : undefined;

    const linkData = useMemo(() => {
        if (existingLinkData) {
            return existingLinkData;
        }
        return link.createInitialData();
    }, [existingLinkData, link]);

    const [newLinkData, setNewLinkData] = useState(linkData);

    const handleRemove = (e: MouseEvent) => {
        e.preventDefault();
        editor.chain().focus().extendMarkRange("link").unsetLinkData().run();
        onClose();
    };

    const handleUpdate = (e: MouseEvent) => {
        e.preventDefault();
        if (isEditing) {
            editor.chain().focus().extendMarkRange("link").unsetLinkData().setLinkData({ data: newLinkData }).run();
        } else {
            editor.chain().focus().setLinkData({ data: newLinkData }).run();
        }
        onClose();
    };

    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, "");

    return (
        <Dialog onClose={onClose} open={true}>
            <DialogTitle>
                {isEditing ? (
                    <FormattedMessage
                        id="dextinity.tipTapRichTextEditor.editLink"
                        defaultMessage='Edit link "{link}"'
                        values={{ link: selectedText }}
                    />
                ) : (
                    <FormattedMessage id="dextinity.tipTapRichTextEditor.insertLink" defaultMessage="Insert link" />
                )}
            </DialogTitle>
            <DialogContent>
                <link.Form data={newLinkData} onChange={setNewLinkData} />
            </DialogContent>
            <StyledDialogActions>
                <CancelButton onClick={onClose} />
                <ButtonContainer>
                    {isEditing && (
                        <DeleteButton onClick={handleRemove}>
                            <FormattedMessage id="dextinity.tipTapRichTextEditor.removeLink" defaultMessage="Delete Link" />
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
