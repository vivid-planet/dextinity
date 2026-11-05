import type { PropsWithChildren } from "react";

import { PreviewSkeletonPlaceholder, type PreviewSkeletonPlaceholderProps } from "./PreviewSkeletonPlaceholder";

interface PreviewSkeletonProps extends PreviewSkeletonPlaceholderProps, PropsWithChildren {
    hasContent: boolean;
}

// Intentionally free of hooks and "use client": when rendered from a server component with content,
// no client reference (carrying title and children) ends up in the RSC payload.
const PreviewSkeleton = ({ children, hasContent, ...placeholderProps }: PreviewSkeletonProps) => {
    if (hasContent) {
        return <>{children}</>;
    }

    return <PreviewSkeletonPlaceholder {...placeholderProps} />;
};

export { PreviewSkeleton };
