import { messages } from "@dextinity/admin";
import { Link } from "@dextinity/admin-icons";
import { ControlButton, findEntityInCurrentSelection, findTextInCurrentSelection, selectionIsInOneBlock } from "@dextinity/admin-rte";
import { Button, Dialog, DialogFormActions, Tooltip } from "@dextinity/ui";
import { EditorState, type EntityInstance, RichUtils } from "draft-js";
import { type FormEvent, type ReactElement, useCallback, useId, useMemo, useState } from "react";
import { useIntl } from "react-intl";

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
        const intl = useIntl();
        const [open, setOpen] = useState(false);
        const linkLabel = intl.formatMessage({ id: "dextinity.rte.extensions.link.buttonTooltip", defaultMessage: "Link" });
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
            <>
                <Tooltip content={linkLabel}>
                    <span>
                        <ControlButton
                            disabled={linkEditCreateDisabled}
                            onButtonClick={handleClick}
                            icon={Link}
                            slotProps={{ root: { "aria-label": linkLabel } }}
                        />
                    </span>
                </Tooltip>
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
            </>
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
        const intl = useIntl();
        const formId = useId();

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

        // removes the selected link entity
        const handleRemove = useCallback(() => {
            const selection = editorState.getSelection();
            if (!selection.isCollapsed()) {
                setEditorState(RichUtils.toggleLink(editorState, selection, null));
            }
            onClose();
        }, [editorState, onClose, setEditorState]);

        // creates or updates the draft link entity
        const handleSubmit = useCallback(
            (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                // React lets submit events of forms in portals, e.g. a dialog of the link block, bubble to this form
                if (event.target !== event.currentTarget) {
                    return;
                }
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
            <Dialog
                open
                onOpenChange={(open) => {
                    if (!open) {
                        onClose();
                    }
                }}
                title={
                    linkEntity
                        ? intl.formatMessage(
                              { id: "dextinity.rteExtensions.cmsLink.editLink", defaultMessage: 'Edit link "{link}"' },
                              { link: selectedText },
                          )
                        : intl.formatMessage({ id: "dextinity.rteExtensions.cmsLink.insertLink", defaultMessage: "Insert link" })
                }
                labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                footer={
                    <DialogFormActions
                        formId={formId}
                        submitLabel={intl.formatMessage(messages.ok)}
                        onCancel={onClose}
                        labels={{ cancel: intl.formatMessage(messages.cancel) }}
                        secondaryActions={
                            linkEntity && (
                                <Button variant="text" color="error" onClick={handleRemove}>
                                    {intl.formatMessage({ id: "dextinity.rteExtensions.cmsLink.removeLink", defaultMessage: "Delete Link" })}
                                </Button>
                            )
                        }
                    />
                }
            >
                <form id={formId} onSubmit={handleSubmit} noValidate>
                    <LinkBlock.AdminComponent state={newLinkState} updateState={setNewLinkState} />
                </form>
            </Dialog>
        );
    }

    return ToolbarButton;
}
