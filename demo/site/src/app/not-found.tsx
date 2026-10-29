import { Link } from "@src/framework/Link";

export default function NotFound404() {
    return (
        <>
            <title>Page not found</title>
            <p>Page not found.</p>
            <Link href="/">Return Home</Link>
        </>
    );
}
