import type { IControlProps } from "../types";
import { FeaturesButtonGroup } from "./FeaturesButtonGroup";
import useHistory from "./useHistory";

export default function HistoryControls({ editorState, setEditorState, options, disabled, editorRef }: IControlProps) {
    const { features } = useHistory({ editorState, setEditorState, supportedThings: options.supports });
    if (features.length < 1) {
        return null;
    }
    return <FeaturesButtonGroup features={features} disabled={disabled} editorRef={editorRef} />;
}
