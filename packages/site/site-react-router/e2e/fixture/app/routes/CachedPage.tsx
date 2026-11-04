import { cacheControlHeaders } from "@dextinity/site-react-router";
import { data } from "react-router";

import type { Route } from "./+types/CachedPage";

export const headers = cacheControlHeaders;

export function loader() {
    return data({ message: "Cached page" }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}

export default function CachedPage({ loaderData }: Route.ComponentProps) {
    return <h1>{loaderData.message}</h1>;
}
