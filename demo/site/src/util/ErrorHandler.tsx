"use client";

import { ErrorHandlerProvider } from "@dextinity/site-nextjs";
import type { ErrorInfo, PropsWithChildren } from "react";

export function ErrorHandler({ children }: PropsWithChildren) {
    function onError(error: Error, errorInfo: ErrorInfo) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error caught by error handler", error, errorInfo.componentStack);
            throw error;
        } else {
            // Log the error to an error tracking service
        }
    }

    return <ErrorHandlerProvider onError={onError}>{children}</ErrorHandlerProvider>;
}
