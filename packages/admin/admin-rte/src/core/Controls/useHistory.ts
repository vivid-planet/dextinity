import { RteRedo, RteUndo } from "@dextinity/admin-icons";
import { EditorState } from "draft-js";
import { type MouseEvent, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import type { SupportedThings } from "../Rte";
import type { IFeatureConfig } from "../types";

interface IProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    supportedThings: SupportedThings[];
}

export default function useHistory({ editorState, setEditorState, supportedThings }: IProps) {
    const intl = useIntl();

    // can check if history is supported
    const supported = useMemo(() => supportedThings.includes("history"), [supportedThings]);
    const canRedo = useMemo(() => !editorState.getRedoStack().isEmpty(), [editorState]);
    const canUndo = useMemo(() => !editorState.getUndoStack().isEmpty(), [editorState]);

    const handleUndoClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            const newEditorState = EditorState.undo(editorState);
            setEditorState(newEditorState);
        },
        [editorState, setEditorState],
    );

    const handleRedoClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            const newEditorState = EditorState.redo(editorState);
            setEditorState(newEditorState);
        },
        [editorState, setEditorState],
    );

    const features: IFeatureConfig[] = useMemo(
        () =>
            supported
                ? [
                      {
                          name: "undo",
                          label: intl.formatMessage({ id: "dextinity.rte.controls.undo.label", defaultMessage: "Undo" }),
                          disabled: !canUndo,
                          onButtonClick: handleUndoClick,
                          icon: RteUndo,
                          tooltipText: intl.formatMessage({ id: "dextinity.rte.controls.undo.tooltip", defaultMessage: "Ctrl+Z" }),
                      },
                      {
                          name: "redo",
                          label: intl.formatMessage({ id: "dextinity.rte.controls.redo.label", defaultMessage: "Redo" }),
                          disabled: !canRedo,
                          onButtonClick: handleRedoClick,
                          icon: RteRedo,
                          tooltipText: intl.formatMessage({ id: "dextinity.rte.controls.redo.tooltip", defaultMessage: "Ctrl+Y" }),
                      },
                  ]
                : [],
        [supported, canRedo, canUndo, handleUndoClick, handleRedoClick, intl],
    );

    return {
        features,
    };
}
