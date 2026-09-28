import { Button } from "@dextinity/admin";
import { Check, Close, Delete, RteLink } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Grid,
    InputBase,
} from "@mui/material";
import { EditorState, RichUtils } from "draft-js";
import { type MouseEvent, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ControlButton } from "../../Controls/ControlButton";
import type { IControlProps } from "../../types";
import findEntityDataInCurrentSelection from "../../utils/findEntityDataInCurrentSelection";
import findEntityInCurrentSelection from "../../utils/findEntityInCurrentSelection";
import selectionIsInOneBlock from "../../utils/selectionIsInOneBlock";
import { ENTITY_TYPE } from "./Decorator";
import type { ILinkProps } from "./EditorComponent";

export default function ToolbarButton(props: IControlProps) {
    const [open, setOpen] = useState(false);
    const linkData = findEntityDataInCurrentSelection<ILinkProps>(props.editorState, ENTITY_TYPE);
    const { entity: previousLinkEntity, entitySelection: linkEntitySelection } = findEntityInCurrentSelection(props.editorState, ENTITY_TYPE);
    const selection = props.editorState.getSelection();
    const linkEditCreateDisabled = (selection.isCollapsed() && !linkData) || !selectionIsInOneBlock(props.editorState);
    const globallyDisabled = !!props.disabled;

    function handleClick(e: MouseEvent) {
        if (linkEditCreateDisabled) {
            return;
        }
        if (previousLinkEntity && linkEntitySelection) {
            // when there is a previous LINK entity found in the selection, force-shrink the selection to the text of this link entity
            // like this we avoid nested links
            props.setEditorState(EditorState.forceSelection(props.editorState, linkEntitySelection));
        }

        setOpen(true);
    }

    return (
        <ControlButton selected={!!linkData} disabled={linkEditCreateDisabled || globallyDisabled} icon={RteLink} onButtonClick={handleClick}>
            <LinkDialog
                editorState={props.editorState}
                onChange={props.setEditorState}
                linkData={linkData}
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
            />
        </ControlButton>
    );
}

function LinkDialog(props: {
    open: boolean;
    onClose: () => void;
    linkData: ILinkProps | null;
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
}) {
    const { onClose, open, linkData, editorState, onChange } = props;
    const linkDataUrl = linkData ? linkData.url : "";
    const [newUrl, setNewUrl] = useState(linkDataUrl);

    useEffect(() => {
        setNewUrl(linkDataUrl);
    }, [linkDataUrl, setNewUrl]);

    const handleClose = () => {
        onClose();
    };

    const handleRemove = (e: MouseEvent) => {
        e.preventDefault();

        setNewUrl("");
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            onChange(RichUtils.toggleLink(editorState, selection, null));
        }
        onClose();
    };

    const handleUpdate = (e: MouseEvent) => {
        e.preventDefault();
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", { url: newUrl });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity,
        });

        onChange(RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey));

        onClose();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle>
                <FormattedMessage id="dextinity.rte.extensions.link.editDialogTitle" defaultMessage="Link" />
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <FormLabel>
                        <FormattedMessage id="dextinity.rte.extensions.link.url" defaultMessage="URL" />
                    </FormLabel>
                    <InputBase
                        // autoFocus
                        value={newUrl}
                        onChange={(e) => {
                            setNewUrl(e.target.value);
                        }}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" startIcon={<Close />}>
                    {/** Same as in @dextinity/admin/messages.ts, not referenced as no dependency specified */}
                    <FormattedMessage id="dextinity.generic.cancel" defaultMessage="Cancel" />
                </Button>
                <div>
                    <Grid container spacing={4}>
                        {linkData && (
                            <Grid>
                                <Button startIcon={<Delete />} onClick={handleRemove}>
                                    {/** Same as in @dextinity/admin/messages.ts, not referenced as no dependency specified */}
                                    <FormattedMessage id="dextinity.generic.delete" defaultMessage="Delete" />
                                </Button>
                            </Grid>
                        )}
                        <Grid>
                            <Button startIcon={<Check />} onClick={handleUpdate} disabled={!newUrl}>
                                {/** Same as in @dextinity/admin/messages.ts, not referenced as no dependency specified */}
                                <FormattedMessage id="dextinity.generic.save" defaultMessage="Save" />
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </DialogActions>
        </Dialog>
    );
}
