import { notFound, redirect } from "@src/framework/navigation";
import { getRequest, isRscRequest } from "@src/framework/requestContext";
import type { PropsWithChildren } from "react";

async function delay() {
    await new Promise((resolve) => setTimeout(resolve, 10));
}

export async function Nested({ children }: PropsWithChildren) {
    await delay();
    return <section>{children}</section>;
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
