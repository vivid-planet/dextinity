import { renderDocument } from "@dextinity/site-react-router/server";
import type { EntryContext } from "react-router";

export default function handleRequest(request: Request, status: number, headers: Headers, routerContext: EntryContext) {
    return renderDocument({ request, status, headers, routerContext });
}
