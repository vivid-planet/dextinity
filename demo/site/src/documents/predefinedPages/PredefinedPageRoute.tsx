import type { GQLPredefinedPageType } from "@src/graphql.generated";
import { NewsPredefinedPage } from "@src/news/NewsPredefinedPage";
import type { JSX } from "react";

import type { PredefinedPage } from "./predefinedPages";

type PredefinedPageRouteProps = {
    predefinedPage: PredefinedPage;
    segments: string[];
};

const predefinedPageRoutes: Record<GQLPredefinedPageType, (props: PredefinedPageRouteProps) => Promise<JSX.Element>> = {
    news: NewsPredefinedPage,
};

export function PredefinedPageRoute({ predefinedPage, segments }: PredefinedPageRouteProps) {
    const Route = predefinedPageRoutes[predefinedPage.type];

    return <Route predefinedPage={predefinedPage} segments={segments} />;
}
