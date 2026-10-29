"use client";

import { notFound, usePathname, usePreview, useSearchParams } from "@dextinity/site-vite-rsc";

export function ClientRouterInfo() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return <p>{`Client pathname: ${pathname}, page: ${searchParams.get("page")}`}</p>;
}

export function ClientPreviewInfo() {
    return <p>{`Preview type: ${usePreview().previewType}`}</p>;
}

export function ClientNotFound(): never {
    notFound();
}

export function ClientError(): never {
    throw new Error("Client component failed");
}
