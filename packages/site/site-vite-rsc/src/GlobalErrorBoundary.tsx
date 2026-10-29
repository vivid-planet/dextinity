"use client";
/* eslint-disable @calm/react-intl/missing-formatted-message, react/jsx-no-literals -- Replaces the whole document, outside of the site's providers like react-intl */

import { Component, type PropsWithChildren } from "react";

import { getNavigationErrorDigest, isNotFoundDigest, parseRedirectDigest } from "./navigation.js";
import { reportError } from "./reportError.js";

type Props = PropsWithChildren<{
    /** The boundary is reset when the key changes, e.g. after navigating to another page */
    resetKey: unknown;
}>;

type State = {
    hasError: boolean;
};

export class GlobalErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        const navigationDigest = getNavigationErrorDigest(error);
        if (navigationDigest) {
            // The server responds with the not found page or the redirect
            const redirect = parseRedirectDigest(navigationDigest);
            if (redirect) {
                window.location.assign(redirect.location);
            } else if (isNotFoundDigest(navigationDigest)) {
                window.location.reload();
            }
            return;
        }
        reportError(error);
    }

    componentDidUpdate(previousProps: Props) {
        if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            // Replaces the whole document, as the root layout is rendered inside the boundary
            return (
                <html>
                    <head>
                        <title>Error</title>
                    </head>
                    <body>
                        <p>Something went wrong.</p>
                        <a href={window.location.href}>Reload page</a>
                    </body>
                </html>
            );
        }
        return this.props.children;
    }
}
