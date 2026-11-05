import { forwardRef, useEffect, useState } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps, useLocation } from "react-router";

import { type IStackSwitchApi, useStackSwitchApi } from "./Switch";

interface StackLinkProps extends Omit<RouterLinkProps, "to"> {
    pageName: string;
    payload: string;
    subUrl?: string;
    switchApi?: IStackSwitchApi;
}

/**
 * The `StackSwitch` of a `switchApi` from `useStackSwitch()` may be rendered after the link, and its API only reflects the current location
 * once the `StackSwitch` has been committed. Therefore, the target URL is resolved after committing, whenever the location changes.
 */
function useTargetUrlOfExternalSwitchApi(switchApi: IStackSwitchApi | undefined, pageName: string, payload: string, subUrl?: string) {
    const location = useLocation();
    const [targetUrl, setTargetUrl] = useState("");
    useEffect(() => {
        if (switchApi) {
            setTargetUrl(switchApi.getTargetUrl(pageName, payload, subUrl));
        }
    }, [switchApi, location, pageName, payload, subUrl]);
    return targetUrl;
}

export const StackLink = forwardRef<HTMLAnchorElement, StackLinkProps>(
    ({ switchApi: externalSwitchApi, payload, pageName, subUrl, children, ...props }, ref) => {
        const internalSwitchApi = useStackSwitchApi();
        // external switchApi allows the creation of StackLinks outside of the stack with the useStackSwitch() hook
        const externalTargetUrl = useTargetUrlOfExternalSwitchApi(externalSwitchApi, pageName, payload, subUrl);
        const targetUrl = externalSwitchApi !== undefined ? externalTargetUrl : internalSwitchApi.getTargetUrl(pageName, payload, subUrl);

        return (
            <RouterLink ref={ref} to={targetUrl} {...props}>
                {children}
            </RouterLink>
        );
    },
);
