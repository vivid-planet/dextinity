import type { PropsWithChildren } from "react";

import { ErrorHandlerBoundaryInternal } from "./ErrorHandlerBoundaryInternal";
import { useErrorHandler } from "./ErrorHandlerProvider";

export function ErrorHandlerBoundary({ children }: PropsWithChildren) {
    const { onError } = useErrorHandler();

    return <ErrorHandlerBoundaryInternal onError={onError}>{children}</ErrorHandlerBoundaryInternal>;
}
