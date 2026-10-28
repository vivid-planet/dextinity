import { Link } from "@src/framework/Link";
import { DefaultTitle } from "@src/layout/DefaultTitle";

export default function NotFound404() {
    return (
        <>
            <DefaultTitle />
            <p>Page not found.</p>
            <Link href="/">Return Home</Link>
        </>
    );
}
