import { cacheControlHeaders } from "@dextinity/site-react-router";
import { data } from "react-router";

export const headers = cacheControlHeaders;

export function loader() {
    return data(null, { headers: { "Cache-Control": "public, s-maxage=60" } });
}

export async function ServerComponent(): Promise<never> {
    throw new Error("Render error of the test app");
}
