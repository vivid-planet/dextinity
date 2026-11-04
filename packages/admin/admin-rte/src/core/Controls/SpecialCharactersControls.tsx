import { ButtonGroup } from "@mui/material";

import NonBreakingSpaceToolbarButton from "../extension/NonBreakingSpace/ToolbarButton";
import { ToolbarButton as SoftHyphenToolbarButton } from "../extension/SoftHyphen/ToolbarButton";
import type { IControlProps } from "../types";

function SpecialCharactersControls(props: IControlProps) {
    const {
        options: { supports: supportedThings },
    } = props;

    if (!supportedThings.includes("non-breaking-space") && !supportedThings.includes("soft-hyphen")) {
        return null;
    }

    return (
        <ButtonGroup>
            {supportedThings.includes("non-breaking-space") && <NonBreakingSpaceToolbarButton {...props} />}
            {supportedThings.includes("soft-hyphen") && <SoftHyphenToolbarButton {...props} />}
        </ButtonGroup>
    );
}

export default SpecialCharactersControls;
