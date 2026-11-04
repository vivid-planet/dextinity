// eslint-disable-next-line no-restricted-imports
import { Button } from "@mui/material";
import type { MouseEventHandler, PropsWithChildren, ReactNode } from "react";

import { BlockAdminComponentPaper } from "./BlockAdminComponentPaper";

interface Props {
    variant?: "primary" | "default";
    size?: "medium" | "large";
    startIcon?: ReactNode;
    onClick?: MouseEventHandler;
    disabled?: boolean;
}

export const BlockAdminComponentButton = ({ variant, size, ...buttonProps }: PropsWithChildren<Props>) => {
    return (
        <BlockAdminComponentPaper disablePadding>
            <Button
                fullWidth
                color={variant === "primary" ? "primary" : "info"}
                sx={({ spacing }) => ({
                    ...(size === "large" && {
                        padding: spacing(4),
                    }),
                })}
                {...buttonProps}
            />
        </BlockAdminComponentPaper>
    );
};
