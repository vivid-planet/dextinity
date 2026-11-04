import type { ContentScope } from "@src/site-configs";
import { Link } from "react-router";

export function SiteNotFound({ scope }: { scope: ContentScope }) {
    return (
        <>
            <p>Page not found (Scope {JSON.stringify(scope)}).</p>
            <Link to={`/${scope.language}`}>Return Home</Link>
        </>
    );
}
