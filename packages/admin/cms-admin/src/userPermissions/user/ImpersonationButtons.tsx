// eslint-disable-next-line no-restricted-imports
import { Button, type ButtonProps } from "@mui/material";
import Cookies from "js-cookie";

import { commonImpersonationMessages } from "../../common/impersonation/commonImpersonationMessages";
import { useCurrentUser, useUserPermissionCheck } from "../hooks/currentUser";

export const StopImpersonationButton = (buttonProps: ButtonProps) => {
    const stopImpersonation = async () => {
        Cookies.remove("dextinity-impersonate-user-id");
        location.href = "/";
    };

    return (
        <Button onClick={stopImpersonation} {...buttonProps}>
            {commonImpersonationMessages.stopImpersonation}
        </Button>
    );
};

export const StartImpersonationButton = ({ userId }: { userId: string }) => {
    const currentUser = useCurrentUser();
    const isAllowed = useUserPermissionCheck();
    const startImpersonation = async () => {
        Cookies.set("dextinity-impersonate-user-id", userId);
        location.href = "/";
    };

    if (!isAllowed("impersonation")) {
        return null;
    }

    if (currentUser.id !== userId && !currentUser.impersonated) {
        return (
            <Button onClick={startImpersonation} variant="contained">
                {commonImpersonationMessages.startImpersonation}
            </Button>
        );
    }

    if (currentUser.impersonated && currentUser.id === userId) {
        return <StopImpersonationButton variant="contained" />;
    }

    return null;
};
