import { SitePreviewProvider } from "@dextinity/site-react-router";
import { getRequestContext } from "@dextinity/site-react-router/server";
import { Outlet } from "react-router";

import { testContext } from "../requestContext";
import { Navigation } from "./Navigation";

export function ServerComponent() {
    const { sitePreview } = getRequestContext().get(testContext);
    return (
        <>
            <Navigation />
            <main>
                {sitePreview ? (
                    <SitePreviewProvider>
                        <Outlet />
                    </SitePreviewProvider>
                ) : (
                    <Outlet />
                )}
            </main>
        </>
    );
}
