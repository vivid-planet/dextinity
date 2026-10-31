"use client";

import { ErrorHandlerBoundary, notFound, useNavigationPending, usePathname, usePreview, useRouter, useSearchParams } from "@dextinity/site-vite-rsc";
import { useEffect } from "react";

export function ClientRouterInfo() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return <p>{`Client pathname: ${pathname}, page: ${searchParams.get("page")}`}</p>;
}

export function RouterControls() {
    const router = useRouter();
    const isNavigationPending = useNavigationPending();
    return (
        <>
            <p>{`Navigation pending: ${isNavigationPending}`}</p>
            <button type="button" onClick={() => router.push("/pages/pushed")}>
                Push
            </button>
            <button type="button" onClick={() => router.replace("/pages/replaced")}>
                Replace
            </button>
            <button type="button" onClick={() => router.refresh()}>
                Refresh
            </button>
        </>
    );
}

/**
 * Lets the browser tests wait until links navigate on the client
 */
export function HydrationMarker() {
    useEffect(() => {
        document.documentElement.dataset.hydrated = "true";
    }, []);
    return null;
}

export function ClientPreviewInfo() {
    return <p>{`Preview type: ${usePreview().previewType}`}</p>;
}

export function ClientNotFound(): never {
    notFound();
}

export function ClientError({ id = "" }: { id?: string }): never {
    throw new Error(`Client component failed${id}`);
}

function FailingAfterClientNavigation() {
    const isAfterClientNavigation =
        typeof window !== "undefined" && new URL(performance.getEntriesByType("navigation")[0].name).pathname !== window.location.pathname;
    if (isAfterClientNavigation) {
        throw new Error("client reference not found 'otherBuild'");
    }
    return <p>Rendered client component of other build</p>;
}

/**
 * Fails like a client component of another build, but only after a client navigation, so that a full page load renders it.
 * Inside the error boundary of blocks, which hides a failed block in production.
 */
export function ClientComponentOfOtherBuild() {
    return (
        <ErrorHandlerBoundary>
            <FailingAfterClientNavigation />
        </ErrorHandlerBoundary>
    );
}
