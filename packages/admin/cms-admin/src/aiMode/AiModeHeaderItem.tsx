import { AppHeaderButton, Tooltip } from "@dextinity/admin";
import { useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { AiModeIcon } from "./AiModeIcon";
import { useAiMode } from "./AiModeProvider";

/** @experimental */
export type AiModeHeaderItemProps = {
    /** Hidden on mobile, where it remains the switch's accessible name. */
    label?: ReactNode;
    icon?: ReactNode;
};

/**
 * The switch that opens and closes the chat of the AI Mode. Renders nothing while the AI Mode is off, see `AiModeProvider`.
 *
 * @experimental
 */
export function AiModeHeaderItem({
    label = <FormattedMessage id="dextinity.aiMode.label" defaultMessage="AI Companion" />,
    icon = <AiModeIcon fontSize="large" />,
}: AiModeHeaderItemProps) {
    const { isEnabled, isAvailable, isOpen, toggle } = useAiMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    if (!isEnabled) {
        return null;
    }

    const button = (
        <Root
            role="switch"
            aria-checked={isOpen}
            disabled={!isAvailable}
            onClick={toggle}
            startIcon={icon}
            endIcon={<Switch data-checked={isOpen || undefined} />}
            slotProps={{ typography: { variant: "subtitle1" } }}
        >
            {isMobile ? <VisuallyHidden>{label}</VisuallyHidden> : label}
        </Root>
    );

    if (isAvailable) {
        return button;
    }

    return (
        <Tooltip title={<FormattedMessage id="dextinity.aiMode.notAvailableOnPage" defaultMessage="Not available on this page" />}>
            {/* A disabled button fires no mouse events, so the tooltip listens on a wrapper. */}
            <span>{button}</span>
        </Tooltip>
    );
}

const Root = styled(AppHeaderButton)(({ theme }) => ({
    color: theme.palette.grey[50],

    "&:hover": {
        backgroundColor: theme.palette.grey.A200,
    },

    "&.Mui-disabled": {
        opacity: theme.palette.action.disabledOpacity,
    },
}));

const VisuallyHidden = styled("span")({
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
});

// Track and thumb geometry match Dextinity's MuiSwitch override (36x16 track, 10px thumb, 20px travel).
// MUI's Switch itself cannot be used here because its <input type="checkbox"> is invalid inside the AppHeaderButton <button>.
const Switch = styled("span")(({ theme }) => ({
    position: "relative",
    width: 36,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.palette.grey.A200,
    boxShadow: `inset 0 0 0 1px ${theme.palette.grey.A100}`,

    "&::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: 3,
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: theme.palette.grey.A100,
        transform: "translateY(-50%)",
        transition: theme.transitions.create(["left", "background-color"]),
    },

    "&[data-checked]": {
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,

        "&::after": {
            left: 23,
            backgroundColor: theme.palette.primary.main,
        },
    },
}));
