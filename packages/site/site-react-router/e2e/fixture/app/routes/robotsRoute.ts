import { robotsResponse } from "@dextinity/site-react-router/server";

export function loader() {
    return robotsResponse(
        { rules: { userAgent: "*", allow: "/" }, sitemap: "https://www.example.com/sitemap.xml" },
        { headers: { "Cache-Control": "public, max-age=900" } },
    );
}
