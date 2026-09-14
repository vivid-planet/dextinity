import { RteIndentDecrease, RteIndentIncrease } from "@dextinity/admin-icons";
import { type BlockMap, type ContentState, EditorState } from "draft-js";
import { type MouseEvent, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import type { SupportedThings } from "../Rte";
import type { IFeatureConfig } from "../types";
import getCurrentBlock from "../utils/getCurrentBlock";
import selectionIsInOneBlock from "../utils/selectionIsInOneBlock";

// https://github.com/facebook/draft-js/blob/v0.11.4/src/model/transaction/adjustBlockDepthForContentState.js
// https://github.com/facebook/draft-js/blob/v0.11.4/src/model/modifier/RichTextEditorUtil.js

// to keep a nested structure, check version 0.10.5, in current version 0.11.4 nesting is not forced
// https://github.com/facebook/draft-js/blob/v0.10.5/src/model/modifier/RichTextEditorUtil.js
function adjustBlockDepth(type: "increase" | "decrease", editorState: EditorState, maxDepth: number): EditorState {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    // check that only one block is selected, otherwise we cananot change depth
    const key = selectionState.getAnchorKey();
    if (key !== selectionState.getFocusKey()) {
        return editorState;
    }

    const adjustment = type === "increase" ? 1 : -1;

    // do not exceed max depth
    const block = getCurrentBlock(editorState);
    if (!block) {
        return editorState;
    }
    const depth = block.getDepth();
    if (adjustment === 1 && depth === maxDepth) {
        return editorState;
    }

    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    let blockMap = contentState.getBlockMap();
    const blocks = blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .map((curBlock) => {
            let blockDepth = curBlock!.getDepth() + adjustment;
            blockDepth = Math.max(0, Math.min(blockDepth, maxDepth));
            return curBlock!.set("depth", blockDepth);
        }) as BlockMap;

    blockMap = blockMap.merge(blocks);

    const newContent = contentState.merge({
        blockMap,
        selectionBefore: selectionState,
        selectionAfter: selectionState,
    }) as ContentState;

    return EditorState.push(editorState, newContent, "adjust-depth");
}

interface IProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    supportedThings: SupportedThings[];
    listLevelMax?: number;
}

export default function useListIndent({ editorState, setEditorState, supportedThings, listLevelMax = 4 }: IProps) {
    const intl = useIntl();

    // can check if indenting lists is supported
    const supported = useMemo(
        () => supportedThings.some((c) => ["ordered-list", "unordered-list"].includes(c) && listLevelMax !== 0),
        [supportedThings, listLevelMax],
    );

    const active = useMemo(() => {
        const currentBlock = getCurrentBlock(editorState);
        if (!currentBlock) {
            return false;
        }
        return ["ordered-list-item", "unordered-list-item"].includes(currentBlock.getType()) && selectionIsInOneBlock(editorState);
    }, [editorState]);

    const canIndentLeft = useMemo(() => active && getCurrentBlock(editorState)!.getDepth() > 0, [active, editorState]);
    const canIndentRight = useMemo(() => active && getCurrentBlock(editorState)!.getDepth() < listLevelMax - 1, [active, editorState, listLevelMax]);

    const handleListIndentLeftClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            setEditorState(adjustBlockDepth("decrease", editorState, listLevelMax));
        },
        [editorState, setEditorState, listLevelMax],
    );
    const handleListIndentRightClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            setEditorState(adjustBlockDepth("increase", editorState, listLevelMax));
        },
        [editorState, setEditorState, listLevelMax],
    );
    const features: IFeatureConfig[] = useMemo(() => {
        return supported
            ? [
                  {
                      name: "list-indent-right",
                      label: "",
                      disabled: !canIndentRight,
                      onButtonClick: handleListIndentRightClick,
                      icon: RteIndentIncrease,
                      tooltipText: intl.formatMessage({ id: "dextinity.rte.controls.listIndent.right.tooltip", defaultMessage: "Tab" }),
                  },
                  {
                      name: "list-indent-left",
                      label: "",
                      disabled: !canIndentLeft,
                      onButtonClick: handleListIndentLeftClick,
                      icon: RteIndentDecrease,
                      tooltipText: intl.formatMessage({ id: "dextinity.rte.controls.listIndent.left.tooltip", defaultMessage: "Shift+Tab" }),
                  },
              ]
            : [];
    }, [supported, canIndentLeft, canIndentRight, handleListIndentLeftClick, handleListIndentRightClick, intl]);

    return {
        features,
    };
}
