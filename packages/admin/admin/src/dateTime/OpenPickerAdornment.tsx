import { css, IconButton, iconButtonClasses, type IconButtonProps, InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";

type OpenPickerAdornmentProps = IconButtonProps & {
    inputIsDisabled?: boolean;
    inputIsReadOnly?: boolean;
};

/**
 * The multi-input range fields of MUI X don't render an open picker button, so the range pickers using them render this one instead.
 */
export const OpenPickerAdornment = ({ inputIsDisabled = false, inputIsReadOnly = false, ...buttonProps }: OpenPickerAdornmentProps) => (
    <InputAdornment position="start">
        <OpenPickerButton tabIndex={-1} disabled={inputIsDisabled || inputIsReadOnly} inputIsDisabled={inputIsDisabled} {...buttonProps} />
    </InputAdornment>
);

const OpenPickerButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== "inputIsDisabled",
})<{ inputIsDisabled: boolean }>(
    ({ theme, inputIsDisabled }) =>
        !inputIsDisabled &&
        css`
            &.${iconButtonClasses.disabled} {
                color: ${theme.palette.text.primary};
            }
        `,
);
