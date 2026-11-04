import { RteNonBreakingSpace } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import Tooltip from "@mui/material/Tooltip";
import { EditorState, Modifier } from "draft-js";
import type { MouseEvent } from "react";
import { FormattedMessage } from "react-intl";

import { ControlButton } from "../../Controls/ControlButton";
import type { IControlProps } from "../../types";

const NO_BREAK_SPACE_UNICODE_CHAR = 0x00a0;

function ToolbarButton({ editorState, setEditorState }: IControlProps) {
    function handleClick(event: MouseEvent) {
        event.preventDefault(); // Preserve focus in editor

        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        // TODO insert \u00a0 in a way that link-entities dont break when inserted in the middle of a link text
        // right now the link is split into 2 link-entities
        // works as expected when \u00ad is copied and pasted: https://unicode.flopp.net/c/00A0
        let textWithEntity;

        if (selection.isCollapsed()) {
            textWithEntity = Modifier.insertText(currentContent, selection, String.fromCharCode(NO_BREAK_SPACE_UNICODE_CHAR));
        } else {
            textWithEntity = Modifier.replaceText(currentContent, selection, String.fromCharCode(NO_BREAK_SPACE_UNICODE_CHAR));
        }
        setEditorState(EditorState.push(editorState, textWithEntity, "insert-characters"));
    }

    return (
        <Tooltip
            title={<FormattedMessage id="dextinity.rte.extensions.nonBreakingSpace.buttonTooltip" defaultMessage="Insert a non-breaking space" />}
            placement="top"
        >
            <span>
                <ControlButton icon={RteNonBreakingSpace} onButtonClick={handleClick} />
            </span>
        </Tooltip>
    );
}

export default ToolbarButton;
