import { defaultTitle } from "@src/layout/defaultTitle";
import { isRouteErrorResponse, Outlet, useRouteLoaderData } from "react-router";

import type { Route } from "./+types/PageErrorBoundary";
import { ErrorPage } from "./ErrorPage";
import type { loader as languageLayoutLoader } from "./LanguageLayout";
import { SiteNotFound } from "./SiteNotFound";

export const meta: Route.MetaFunction = ({ error }) => {
    if (!error) {
        // React Router uses the meta of the deepest route that has one, the pages without a title get the default one
        return [{ title: defaultTitle }];
    }
    return [{ title: isRouteErrorResponse(error) && error.status === 404 ? "Page not found" : "Something went wrong" }];
};

export default function PageErrorBoundary() {
    return <Outlet />;
}

/**
 * The not found and error pages of the site, inside the header and footer of the language layout
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    const languageLayoutData = useRouteLoaderData<typeof languageLayoutLoader>("language");
    if (isRouteErrorResponse(error) && error.status === 404 && languageLayoutData) {
        return <SiteNotFound scope={languageLayoutData.scope} />;
    }
    return <ErrorPage />;
}
