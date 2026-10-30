"use client";

import { notFound, useNavigationPending, usePathname, usePreview, useRouter, useSearchParams } from "@dextinity/site-vite-rsc";
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
