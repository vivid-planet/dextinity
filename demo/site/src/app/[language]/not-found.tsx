import { Link } from "@src/framework/Link";
import type { ContentScope } from "@src/site-configs";

export default function NotFound404({ scope }: { scope: ContentScope }) {
    return (
        <>
            <title>Page not found</title>
            <p>Page not found (Scope {JSON.stringify(scope)}).</p>
            <Link href={`/${scope.language}`}>Return Home</Link>
        </>
    );
}
