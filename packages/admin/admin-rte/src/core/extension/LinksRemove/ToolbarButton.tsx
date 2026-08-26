import { RteClearLink } from "@dextinity/admin-icons";
import { RichUtils } from "draft-js";
import type { MouseEvent } from "react";

import { ControlButton } from "../../Controls/ControlButton";
import type { IControlProps } from "../../types";

export default function ToolbarButton(props: IControlProps) {
    const selection = props.editorState.getSelection();
    const globallyDisabled = !!props.disabled;

    const buttonEnabled = !selection.isCollapsed(); // @TODO: better to scan the selection if any link-entities are in the selection
    function handleClick(e: MouseEvent) {
        e.preventDefault();
        if (buttonEnabled) {
            props.setEditorState(RichUtils.toggleLink(props.editorState, selection, null)); // @TODO, this removes all entities not only LINK entity, should be improved, now its ok as there are no other entities than links
        }
    }

    return <ControlButton icon={RteClearLink} disabled={globallyDisabled || !buttonEnabled} onButtonClick={handleClick} />;
}
