import { createMetadata } from "@dextinity/site-react-router";

import type { Route } from "./+types/HomePage";

export const meta: Route.MetaFunction = () => createMetadata({ title: "Home", baseUrl: "https://www.example.com", canonicalUrl: "/" });

export default function HomePage() {
    return <h1>Home page</h1>;
}
