import { Button, type ButtonProps, Icon, Tooltip } from "@dextinity/ui";
import { useId } from "react";
import { useIntl } from "react-intl";

import { useCurrentUser, useUserPermissionCheck } from "../hooks/currentUser";
import { startImpersonation, stopImpersonation } from "../utils/handleImpersonation";
import { useImpersonationMessages } from "./useImpersonationMessages";

export type StopImpersonationButtonProps = Omit<ButtonProps, "children" | "onClick" | "href">;

export const StopImpersonationButton = (buttonProps: StopImpersonationButtonProps) => {
    const { stopImpersonation: label } = useImpersonationMessages();
    return (
        <Button startIcon={<Icon name="reset" />} {...buttonProps} onClick={() => void stopImpersonation()}>
            {label}
        </Button>
    );
};

interface StartImpersonationButtonProps {
    userId: string;
    /** Whether the user can be impersonated; disables the button with the reason when `false`. */
    impersonationAllowed?: boolean;
}

/**
 * Starts the impersonation of the user, or stops it while the user is impersonated. Renders nothing without the `impersonation`
 * permission.
 */
export const StartImpersonationButton = ({ userId, impersonationAllowed = true }: StartImpersonationButtonProps) => {
    const intl = useIntl();
    const currentUser = useCurrentUser();
    const isAllowed = useUserPermissionCheck();
    const messages = useImpersonationMessages();
    const disabledReasonId = useId();

    if (!isAllowed("impersonation")) {
        return null;
    }

    if (currentUser.impersonated) {
        return currentUser.id === userId ? <StopImpersonationButton variant="outlined" color="secondary" /> : null;
    }

    const disabledReason =
        currentUser.id === userId
            ? messages.cannotImpersonateYourself
            : !impersonationAllowed
              ? intl.formatMessage({
                    id: "dextinity.userPermissions.cannotImpersonateReason",
                    defaultMessage: "This user has permissions or content scopes that you don't have",
                })
              : undefined;
    const button = (
        <Button
            variant="outlined"
            color="secondary"
            startIcon={<Icon name="impersonate-user" />}
            disabled={disabledReason !== undefined}
            focusableWhenDisabled
            aria-describedby={disabledReason ? disabledReasonId : undefined}
            onClick={() => void startImpersonation(userId)}
        >
            {messages.startImpersonation}
        </Button>
    );

    return disabledReason ? (
        <>
            <Tooltip content={disabledReason}>{button}</Tooltip>
            <span id={disabledReasonId} hidden>
                {disabledReason}
            </span>
        </>
    ) : (
        button
    );
};
