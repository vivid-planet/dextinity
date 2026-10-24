import type { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <title>Fixture</title>
            </head>
            <body>{children}</body>
        </html>
    );
}
