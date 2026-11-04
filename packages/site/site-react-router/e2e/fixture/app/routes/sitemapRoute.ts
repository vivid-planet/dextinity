import { sitemapResponse } from "@dextinity/site-react-router/server";

export function loader() {
    return sitemapResponse([{ url: "https://www.example.com/", changeFrequency: "daily", priority: 1 }]);
}
