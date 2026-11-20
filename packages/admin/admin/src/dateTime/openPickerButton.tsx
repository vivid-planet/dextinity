import { css, iconButtonClasses, inputAdornmentClasses, type Theme } from "@mui/material";
import { pickersInputBaseClasses } from "@mui/x-date-pickers";
import type { ReactNode } from "react";

/**
 * Renders the `openPicker` icon of the `iconMapping`, which is passed as `children` because MUI X expects a component for the `openPickerIcon` slot.
 */
export const OpenPickerIcon = ({ children }: { children?: ReactNode }) => <>{children}</>;

export const getOpenPickerButtonStyles = (theme: Theme) => css`
    .${pickersInputBaseClasses.root}:not(.${pickersInputBaseClasses.disabled})
        .${inputAdornmentClasses.positionStart}
        .${iconButtonClasses.disabled} {
        color: ${theme.palette.text.primary};
    }
`;
