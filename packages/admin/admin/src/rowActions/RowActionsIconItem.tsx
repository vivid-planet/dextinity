import { IconButton, type IconButtonProps } from "@mui/material";
import { forwardRef, type ReactNode } from "react";

import { Tooltip, type TooltipProps } from "../common/Tooltip";
import type { CommonRowActionItemProps } from "./RowActionsItem";

export interface RowActionsIconItemComponentsProps {
    tooltip?: Partial<TooltipProps>;
    iconButton?: Partial<IconButtonProps>;
}

export interface RowActionsIconItemProps extends CommonRowActionItemProps {
    componentsProps?: RowActionsIconItemComponentsProps;
    tooltip?: ReactNode;
}

export const RowActionsIconItem = forwardRef<HTMLButtonElement, RowActionsIconItemProps>(
    ({ icon, tooltip, componentsProps = {}, ...restIconButtonProps }, ref) => {
        const { tooltip: tooltipProps, iconButton: iconButtonProps } = componentsProps;

        const combinedIconButtonProps = { ...restIconButtonProps, ...iconButtonProps };
        const buttonIsDisabled = Boolean(combinedIconButtonProps.disabled);

        const button = (
            <IconButton {...combinedIconButtonProps} ref={ref}>
                {icon}
            </IconButton>
        );

        if (tooltip && !buttonIsDisabled) {
            return (
                <Tooltip title={tooltip} {...tooltipProps}>
                    {button}
                </Tooltip>
            );
        }

        return <>{button}</>;
    },
);
