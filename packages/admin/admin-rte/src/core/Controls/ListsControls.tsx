import type { IControlProps } from "../types";
import { FeaturesButtonGroup } from "./FeaturesButtonGroup";
import useBlockTypes from "./useBlockTypes";

export default function ListsControls({
    editorState,
    setEditorState,
    editorRef,
    options: { supports: supportedThings, blocktypeMap, standardBlockType },
    disabled,
}: IControlProps) {
    const { listsFeatures } = useBlockTypes({ editorState, setEditorState, supportedThings, blocktypeMap, editorRef, standardBlockType });
    if (listsFeatures.length < 1) {
        return null;
    }
    return <FeaturesButtonGroup features={listsFeatures} disabled={disabled} editorRef={editorRef} />;
}
