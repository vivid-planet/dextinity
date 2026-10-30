import { Link } from "@dextinity/site-vite-rsc";

export function RootNotFound() {
    return (
        <>
            <title>Page not found</title>
            <p>Page not found.</p>
            <Link href="/">Return Home</Link>
        </>
    );
}
