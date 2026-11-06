import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { useIntl } from "react-intl";

import type { BlockInterface, BlockState, LinkBlockInterface } from "../types";
import { TipTapDialog } from "./TipTapDialog";

interface TipTapLinkDialogProps {
    editor: Editor;
    linkBlock: BlockInterface & LinkBlockInterface;
    onClose: () => void;
}

export function TipTapLinkDialog({ editor, linkBlock: LinkBlock, onClose }: TipTapLinkDialogProps) {
    const intl = useIntl();
    const isEditing = editor.isActive("link");
    const [linkState, setLinkState] = useState<BlockState<typeof LinkBlock>>(
        () => (isEditing ? (editor.getAttributes("link").data as BlockState<typeof LinkBlock> | undefined) : undefined) ?? LinkBlock.defaultValues(),
    );

    const handleSubmit = () => {
        if (isEditing) {
            editor.chain().focus().extendMarkRange("link").unsetCmsLink().setCmsLink({ data: linkState }).run();
        } else {
            editor.chain().focus().setCmsLink({ data: linkState }).run();
        }
    };

    const selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, "");

    return (
        <TipTapDialog
            title={
                isEditing
                    ? intl.formatMessage(
                          { id: "dextinity.blocks.tipTapRichText.editLink", defaultMessage: 'Edit link "{link}"' },
                          { link: selectedText },
                      )
                    : intl.formatMessage({ id: "dextinity.blocks.tipTapRichText.insertLink", defaultMessage: "Insert link" })
            }
            onSubmit={handleSubmit}
            onClose={onClose}
            onRemove={isEditing ? () => editor.chain().focus().extendMarkRange("link").unsetCmsLink().run() : undefined}
            removeLabel={intl.formatMessage({ id: "dextinity.blocks.tipTapRichText.removeLink", defaultMessage: "Delete Link" })}
        >
            <LinkBlock.AdminComponent state={linkState} updateState={setLinkState} />
        </TipTapDialog>
    );
}
