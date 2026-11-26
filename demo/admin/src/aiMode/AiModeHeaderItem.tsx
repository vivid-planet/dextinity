import { AppHeaderButton, Tooltip } from "@dextinity/admin";
import { useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage, useIntl } from "react-intl";

import { useAiMode } from "./AiModeContext";
import { AiModeIcon } from "./AiModeIcon";

export function AiModeHeaderItem() {
    const { isAvailable, isOpen, toggle } = useAiMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const intl = useIntl();

    const label = intl.formatMessage({ id: "aiMode.label", defaultMessage: "AI Companion" });

    const button = (
        <Root
            role="switch"
            aria-checked={isOpen}
            aria-label={isMobile ? label : undefined}
            disabled={!isAvailable}
            onClick={toggle}
            startIcon={<AiModeIcon fontSize="large" />}
            endIcon={<Switch data-checked={isOpen || undefined} />}
            slotProps={{ typography: { variant: "subtitle1" } }}
        >
            {!isMobile && label}
        </Root>
    );

    if (isAvailable) {
        return button;
    }

    return (
        <Tooltip title={<FormattedMessage id="aiMode.notAvailableOnPage" defaultMessage="The AI Companion isn't available on this page." />}>
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

// Track and thumb geometry match Comet's MuiSwitch override (36x16 track, 10px thumb, 20px travel).
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
