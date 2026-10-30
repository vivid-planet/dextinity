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

export async function ServerError(): Promise<never> {
    await delay();
    throw new Error("Server component failed");
}
