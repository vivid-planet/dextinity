import { getNotFoundContext } from "@src/util/ServerContext";
import Link from "next/link";
import type { JSX } from "react";

export default async function NotFound404(): Promise<JSX.Element> {
    const scope = getNotFoundContext() || { domain: "main", language: "en" };

    return (
        <html lang={scope.language}>
            <body>
                <p>Page not found (Scope {JSON.stringify(scope)}).</p>
                <Link href={`/${scope.language}`}>Return Home</Link>
            </body>
        </html>
    );
}
