"use client";

import { notFound } from "@src/framework/navigation";
import { usePathname, useSearchParams } from "@src/framework/RouterProvider";

export function ClientRouterInfo() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return <p>{`Client pathname: ${pathname}, page: ${searchParams.get("page")}`}</p>;
}

export function ClientNotFound(): never {
    notFound();
}

export function ClientError(): never {
    throw new Error("Client component failed");
}
