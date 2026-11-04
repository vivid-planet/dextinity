"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { usePreview } from "../preview/usePreview";
import { useCookieApi } from "./CookieApiContext";

type Props = PropsWithChildren<{
    consented: boolean;
    fallback: ReactNode;
    loading: ReactNode;
}>;

export const CookieSafe = ({ consented, fallback, loading, children }: Props) => {
    const { initialized } = useCookieApi();
    const { previewType } = usePreview();
    const isInPreview = previewType !== "NoPreview";

    if ((initialized && consented) || isInPreview) {
        return <>{children}</>;
    }

    if (!initialized) {
        return <>{loading}</>;
    }

    return <>{fallback}</>;
};
