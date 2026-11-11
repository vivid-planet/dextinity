import type { PredefinedPageRouteDefinition } from "@src/documents/predefinedPages/PredefinedPageRoute";

import { NewsDetailPage } from "./NewsDetailPage";
import { NewsIndexPage } from "./NewsIndexPage";

export const newsRoutes: PredefinedPageRouteDefinition[] = [
    { path: "/", component: NewsIndexPage },
    { path: "/:slug", component: NewsDetailPage },
];
