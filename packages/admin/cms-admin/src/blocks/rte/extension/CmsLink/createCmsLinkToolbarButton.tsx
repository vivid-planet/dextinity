import { CancelButton, DeleteButton, OkayButton } from "@dextinity/admin";
import { Link } from "@dextinity/admin-icons";
import { ControlButton, findEntityInCurrentSelection, findTextInCurrentSelection, selectionIsInOneBlock } from "@dextinity/admin-rte";
// eslint-disable-next-line no-restricted-imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import { EditorState, type EntityInstance, RichUtils } from "draft-js";
import { type MouseEvent, type ReactElement, useCallback, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { BlockInterface, BlockState } from "../../../types";
import { ENTITY_TYPE } from "./Decorator";

interface IProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
}

interface CreateCmsLinkToolbarButtonOptions {
    link: BlockInterface;
}

export function createCmsLinkToolbarButton({ link: LinkBlock }: CreateCmsLinkToolbarButtonOptions): (props: IProps) => ReactElement {
    function ToolbarButton({ editorState, setEditorState }: IProps) {
        const [open, setOpen] = useState(false);
        const { entity: linkEntity, entitySelection: linkSelection } = findEntityInCurrentSelection(editorState, ENTITY_TYPE);
        const selection = editorState.getSelection();
        const linkEditCreateDisabled = !linkEntity && (selection.isCollapsed() || !selectionIsInOneBlock(editorState)); // when a link entity is found it is always editable, when no entity is found, creating a link is disabled when no char is selected (selection.isCollapsed()) or when the selection exceeds a block (a link over multiple blocks is normally not intended)
        const selectedText = findTextInCurrentSelection(editorState);

        function handleClick() {
            // when multiple blocks are selected making a link is disabled
            if (linkEditCreateDisabled) {
                return;
            }
            if (linkEntity && linkSelection) {
                // when there is a previous LINK entity found in the selection, force-shrink the selection to the text of this link entity
                setEditorState(EditorState.forceSelection(editorState, linkSelection));
            }
            setOpen(true);
        }
        return (
            <ControlButton disabled={linkEditCreateDisabled} onButtonClick={handleClick} icon={Link}>
                {open && (
                    <LinkDialog
                        editorState={editorState}
                        setEditorState={setEditorState}
                        linkEntity={linkEntity}
                        selectedText={selectedText}
                        onClose={() => {
                            setOpen(false);
                        }}
                    />
                )}
            </ControlButton>
        );
    }

    interface ILinkDialogProps {
        onClose: () => void;
        linkEntity: EntityInstance | null;
        selectedText: string;
        editorState: EditorState;
        setEditorState: (editorState: EditorState) => void;
    }
    function LinkDialog({ onClose, linkEntity, editorState, setEditorState, selectedText }: ILinkDialogProps) {
        // provides the form inputs

        const linkState: BlockState<typeof LinkBlock> = useMemo(() => {
            if (linkEntity) {
                // editing link, create a clone to edit in dialog (as the user might cancel editing)
                return linkEntity.getData() as BlockState<typeof LinkBlock>;
            } else {
                // no link in selection, create a new link
                return LinkBlock.defaultValues();
            }
        }, [linkEntity]);

        const [newLinkState, setNewLinkState] = useState<BlockState<typeof LinkBlock>>(linkState);

        const handleClose = () => {
            onClose();
        };

        // removes the selected link entity
        const handleRemove = useCallback(
            (e: MouseEvent) => {
                e.preventDefault();

                const selection = editorState.getSelection();
                if (!selection.isCollapsed()) {
                    setEditorState(RichUtils.toggleLink(editorState, selection, null));
                }
                onClose();
            },
            [editorState, onClose, setEditorState],
        );

        // creates or updates the draft link entity
        const handleUpdate = useCallback(
            (e: MouseEvent) => {
                e.preventDefault();
                const selection = editorState.getSelection();
                // update the data in the entity
                const contentState = editorState.getCurrentContent();
                const contentStateWithEntity = contentState.createEntity(ENTITY_TYPE, "MUTABLE", newLinkState);
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const newEditorState = EditorState.push(editorState, contentStateWithEntity, "apply-entity");
                setEditorState(RichUtils.toggleLink(newEditorState, selection, entityKey));

                onClose();
            },
            [editorState, setEditorState, onClose, newLinkState],
        );

        return (
            <Dialog onClose={handleClose} open={true}>
                <DialogTitle>
                    {linkEntity ? (
                        <FormattedMessage
                            id="dextinity.rteExtensions.cmsLink.editLink"
                            defaultMessage='Edit link "{link}"'
                            values={{ link: selectedText }}
                        />
                    ) : (
                        <FormattedMessage id="dextinity.rteExtensions.cmsLink.insertLink" defaultMessage="Insert link" />
                    )}
                </DialogTitle>
                <DialogContent>
                    <LinkBlock.AdminComponent state={newLinkState} updateState={setNewLinkState} />
                </DialogContent>
                <StyledDialogActions>
                    <CancelButton onClick={handleClose} />
                    <ButtonContainer>
                        {linkEntity && (
                            <DeleteButton onClick={handleRemove}>
                                <FormattedMessage id="dextinity.rteExtensions.cmsLink.removeLink" defaultMessage="Delete Link" />
                            </DeleteButton>
                        )}
                        <OkayButton onClick={handleUpdate} />
                    </ButtonContainer>
                </StyledDialogActions>
            </Dialog>
        );
    }

    return ToolbarButton;
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
