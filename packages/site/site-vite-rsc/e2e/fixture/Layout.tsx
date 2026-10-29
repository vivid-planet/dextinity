import type { PropsWithChildren } from "react";

import { ClientPreviewInfo } from "./clientComponents.js";

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <title>Fixture</title>
            </head>
            <body>
                <ClientPreviewInfo />
                {children}
            </body>
        </html>
    );
}
