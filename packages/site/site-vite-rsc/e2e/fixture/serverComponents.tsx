import { notFound, redirect } from "@dextinity/site-vite-rsc";
import { getRequest, isRscRequest } from "@dextinity/site-vite-rsc/server";
import type { PropsWithChildren } from "react";

async function delay() {
    await new Promise((resolve) => setTimeout(resolve, 10));
}

export async function Nested({ children }: PropsWithChildren) {
    await delay();
    return <section>{children}</section>;
}

let renderCount = 0;

export function RenderCount() {
    renderCount += 1;
    return <p>{`Server render ${renderCount}`}</p>;
}

declare global {
    var coalescingRenderCounts: Map<string, number> | undefined;
}

export function getCoalescingRenderCount(id: string) {
    return globalThis.coalescingRenderCounts?.get(id) ?? 0;
}

/**
 * Counts its renders per `id`, and stays in flight for `delay` milliseconds so that concurrent requests can share the render
 */
export async function CountedRender({ id, delay, shouldFail }: { id: string; delay: number; shouldFail?: boolean }) {
    globalThis.coalescingRenderCounts ??= new Map();
    const renderCount = getCoalescingRenderCount(id) + 1;
    globalThis.coalescingRenderCounts.set(id, renderCount);
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (shouldFail) {
        throw new Error(`Counted render failed${id}`);
    }
    return <p>{`Counted render ${renderCount} of ${id}`}</p>;
}

export function RequestInfo() {
    const url = new URL(getRequest().url);
    return <p>{`Server pathname: ${url.pathname}, search: ${url.search}, RSC request: ${isRscRequest()}`}</p>;
}

export async function ServerNotFound(): Promise<never> {
    await delay();
    notFound();
}

export async function ServerRedirect({ location, status }: { location: string; status?: 301 | 302 | 307 | 308 }): Promise<never> {
    await delay();
    redirect(location, status);
}

export async function ServerError({ id = "" }: { id?: string }): Promise<never> {
    await delay();
    throw new Error(`Server component failed${id}`);
}
