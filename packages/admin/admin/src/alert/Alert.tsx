import { Close } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import { Alert as MuiAlert, alertClasses, AlertTitle, IconButton, Typography } from "@mui/material";
import { css, useThemeProps } from "@mui/material/styles";
import { forwardRef, type ReactNode } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export interface AlertProps
    extends ThemedComponentBaseProps<{
        root: typeof MuiAlert;
        title: typeof AlertTitle;
        text: typeof Typography;
        action: "div";
        closeIcon: typeof IconButton;
    }> {
    /**
     * The severity level of the alert
     * - 'info' (default): For general information or neutral messages
     * - 'success': For successful operations or positive feedback
     * - 'warning': For warnings that require attention but aren't critical
     * - 'error': For critical issues or failed operations
     */
    severity?: "info" | "warning" | "error" | "success";
    title?: ReactNode;
    children?: ReactNode;

    /**
     * Callback fired when the close icon is clicked.
     *
     * If `onClose` is provided, a close icon button will be displayed in the alert.
     */
    onClose?: () => void;

    /**
     * The action to display in the alert.
     *
     * This can be used to provide additional actions for the user to take, such as buttons or links.
     *
     * If the title is provided, the action will be displayed below the title and text. If no title is provided, the action will be displayed to the right of the text.
     */
    action?: ReactNode;
}

export type AlertClassKey = "root" | "title" | "text" | "action" | "closeIcon" | "hasTitle" | "singleRow";

type OwnerState = {
    hasTitle: boolean;
    renderAsSingleRow: boolean;
};

/**
 * The Alert component is used to display important messages to the user. It provides different severity levels
 * and custom content, actions and close functionality to communicate various types of information.
 * Use for feedback messages, notifications, or status updates.
 *
 * - [Storybook](https://cms-storybook.dextinity.com/?path=/docs/@dextinity/admin_components-alert-alert--docs)
 * - [MUI Documentation](https://mui.com/material-ui/react-alert/)
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>((inProps, ref) => {
    const {
        severity = "info",
        title,
        children,
        onClose,
        action,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminAlert" });
    const singleRow = !title && (action || onClose);

    const ownerState: OwnerState = {
        hasTitle: Boolean(title),
        renderAsSingleRow: Boolean(singleRow),
    };

    return (
        <Root ref={ref} ownerState={ownerState} severity={severity} {...slotProps?.root} {...restProps}>
            {Boolean(title) && <Title {...slotProps?.title}>{title}</Title>}
            <Text variant="body2" {...slotProps?.text}>
                {children}
            </Text>
            {action && (
                <Action ownerState={ownerState} {...slotProps?.action}>
                    {action}
                </Action>
            )}
            {onClose && (
                <CloseIcon onClick={onClose} ownerState={ownerState} {...slotProps?.closeIcon}>
                    <Close />
                </CloseIcon>
            )}
        </Root>
    );
});

const Root = createComponentSlot(MuiAlert)<AlertClassKey, OwnerState>({
    componentName: "Alert",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.hasTitle && "hasTitle", ownerState.renderAsSingleRow && "singleRow"];
    },
})(
    ({ theme, ownerState }) => css`
        padding: ${theme.spacing(4, "12px", 4, 4)};

        & .${alertClasses.message} {
            display: flex;
            align-items: center;
            flex-grow: 1;
        }

        ${ownerState.hasTitle &&
        css`
            position: relative;
            align-items: flex-start;
            padding: ${theme.spacing(4, 6, 4, 4)};

            & .${alertClasses.message} {
                flex-direction: column;
                align-items: flex-start;
            }
        `}

        ${ownerState.renderAsSingleRow &&
        css`
            display: flex;
            align-items: center;
            padding: ${theme.spacing(2, 4, 2, 4)};
        `}
    `,
);

const Title = createComponentSlot(AlertTitle)<AlertClassKey>({
    componentName: "Alert",
    slotName: "title",
})(css`
    margin-top: 0px;
`);

const Text = createComponentSlot(Typography)<AlertClassKey>({
    componentName: "Alert",
    slotName: "text",
})(css`
    flex-grow: 1;
`);

const Action = createComponentSlot("div")<AlertClassKey, OwnerState>({
    componentName: "Alert",
    slotName: "action",
})(
    ({ theme, ownerState }) => css`
        ${ownerState.hasTitle &&
        css`
            margin-top: ${theme.spacing(2)};
        `}
    `,
);

const CloseIcon = createComponentSlot(IconButton)<AlertClassKey, OwnerState>({
    componentName: "Alert",
    slotName: "closeIcon",
})(
    ({ ownerState }) => css`
        ${ownerState.hasTitle &&
        css`
            position: absolute;
            right: 2px;
            top: 2px;
        `}

        ${ownerState.renderAsSingleRow &&
        css`
            padding: 10px;
        `}
    `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminAlert: AlertProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminAlert: AlertClassKey;
    }

    interface Components {
        DextinityAdminAlert?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminAlert"]>;
            styleOverrides?: ComponentNameToClassKey["DextinityAdminAlert"];
        };
    }
}
