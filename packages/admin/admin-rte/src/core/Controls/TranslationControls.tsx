import { useContentTranslationService } from "@dextinity/admin";
import { ButtonGroup } from "@mui/material";

import TranslationToolbarButton from "../translation/ToolbarButton";
import type { IControlProps } from "../types";

function TranslationControls(props: IControlProps) {
    const translationContext = useContentTranslationService();

    if (translationContext.enabled && !props.options.disableContentTranslation) {
        return (
            <ButtonGroup>
                <TranslationToolbarButton {...props} />
            </ButtonGroup>
        );
    }
    return null;
}

export default TranslationControls;
