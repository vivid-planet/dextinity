import type { IControlProps } from "../types";
import { FeaturesButtonGroup } from "./FeaturesButtonGroup";
import useListIndent from "./useListIndent";

export default function ListsIndentControls({
    editorState,
    setEditorState,
    options: { supports: supportedThings, listLevelMax },
    disabled,
    editorRef,
}: IControlProps) {
    const { features } = useListIndent({ editorState, setEditorState, supportedThings, listLevelMax });
    if (features.length < 1) {
        return null;
    }
    return <FeaturesButtonGroup features={features} disabled={disabled} editorRef={editorRef} />;
}
