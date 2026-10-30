import type { PropsWithChildren } from "react";

import { ClientPreviewInfo, HydrationMarker } from "./clientComponents.js";

export function Layout({ title = "Fixture", children }: PropsWithChildren<{ title?: string }>) {
    return (
        <html lang="en">
            <head>
                <title>{title}</title>
            </head>
            <body>
                <HydrationMarker />
                <ClientPreviewInfo />
                {children}
            </body>
        </html>
    );
}
