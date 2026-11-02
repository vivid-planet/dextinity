import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

import { type IStackSwitchApi, useStackSwitchApi } from "./Switch";

interface StackLinkProps extends Omit<RouterLinkProps, "to"> {
    pageName: string;
    payload: string;
    subUrl?: string;
    switchApi?: IStackSwitchApi;
}

export const StackLink = forwardRef<HTMLAnchorElement, StackLinkProps>(
    ({ switchApi: externalSwitchApi, payload, pageName, subUrl, children, ...props }, ref) => {
        const internalSwitchApi = useStackSwitchApi();
        // external switchApi allows the creation of StackLinks outside of the stack with the useStackSwitch() hook
        const _switchApi = externalSwitchApi !== undefined ? externalSwitchApi : internalSwitchApi;

        return (
            <RouterLink ref={ref} to={_switchApi.getTargetUrl(pageName, payload, subUrl)} {...props}>
                {children}
            </RouterLink>
        );
    },
);
