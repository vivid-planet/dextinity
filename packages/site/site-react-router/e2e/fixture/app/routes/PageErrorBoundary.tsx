import { Outlet } from "react-router";

export { ErrorBoundary } from "./PageErrorPage";

// Below the preview layout, so that the error pages are rendered in it
export function ServerComponent() {
    return <Outlet />;
}
