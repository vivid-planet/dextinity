import type { IControlProps } from "../types";
import { FeaturesButtonGroup } from "./FeaturesButtonGroup";
import useInlineStyleType from "./useInlineStyleType";

export default function InlineStyleTypeControls({
    editorState,
    setEditorState,
    options: { supports: supportedThings, customInlineStyles },
    disabled,
    editorRef,
}: IControlProps) {
    const { features } = useInlineStyleType({ editorState, setEditorState, supportedThings, customInlineStyles, editorRef });
    if (!features) {
        return null;
    }
    return <FeaturesButtonGroup features={features} disabled={disabled} editorRef={editorRef} maxVisible={4} />;
}
