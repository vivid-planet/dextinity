import { useContentTranslationService } from "@dextinity/admin";
import { ButtonGroup } from "@mui/material";

import TranslationToolbarButton from "../translation/ToolbarButton";
import type { IControlProps } from "../types";

function TranslationControls(props: IControlProps) {
    const translationContext = useContentTranslationService();

    if (translationContext.enabled && !props.options.disableContentTranslation) {
        const TranslationButton = props.options.overwriteTranslationButton ?? TranslationToolbarButton;
        return (
            <ButtonGroup>
                <TranslationButton {...props} />
            </ButtonGroup>
        );
    }
    return null;
}

export default TranslationControls;
