import type { GQLPredefinedPageType } from "@src/graphql.generated";
import { newsRoutes } from "@src/news/newsRoutes";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { matchRoute } from "./matchRoute";
import type { PredefinedPage } from "./predefinedPages";

export type PredefinedPageRouteProps = {
    predefinedPage: PredefinedPage;
    params: Record<string, string>;
};

export type PredefinedPageRouteDefinition = {
    path: string;
    component: (props: PredefinedPageRouteProps) => Promise<JSX.Element>;
};

const predefinedPageRoutes: Record<GQLPredefinedPageType, PredefinedPageRouteDefinition[]> = {
    news: newsRoutes,
};

export function PredefinedPageRoute({ predefinedPage, path }: { predefinedPage: PredefinedPage; path: string }) {
    const match = matchRoute(predefinedPageRoutes[predefinedPage.type], path);

    if (!match) {
        notFound();
    }

    const { component: Component } = match.route;

    return <Component predefinedPage={predefinedPage} params={match.params} />;
}
