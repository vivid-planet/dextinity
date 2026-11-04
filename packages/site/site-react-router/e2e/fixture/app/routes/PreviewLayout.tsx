import { SitePreviewProvider, usePreview } from "@dextinity/site-react-router";
import { getSitePreview, getVisibility, sitePreviewMiddleware } from "@dextinity/site-react-router/server";
import { Link, Outlet } from "react-router";

import type { Route } from "./+types/PreviewLayout";

export const middleware: Route.MiddlewareFunction[] = [sitePreviewMiddleware];

export function loader({ context }: Route.LoaderArgs) {
    return { isSitePreview: getSitePreview(context) !== undefined, visibility: getVisibility(context) };
}

function PreviewInfo({ visibility }: { visibility: string }) {
    const { previewType } = usePreview();
    return (
        <p>
            Preview type: {previewType}, visibility: {visibility}
        </p>
    );
}

export default function PreviewLayout({ loaderData: { isSitePreview, visibility } }: Route.ComponentProps) {
    const content = (
        <>
            <PreviewInfo visibility={visibility} />
            <nav>
                <Link to="/">Home</Link> <Link to="/cached">Cached</Link> <Link to="/not-found">Not found</Link> <Link to="/redirect">Redirect</Link>{" "}
                <Link to="/server-error">Server error</Link>
            </nav>
            <Outlet />
        </>
    );
    return isSitePreview ? <SitePreviewProvider>{content}</SitePreviewProvider> : content;
}
