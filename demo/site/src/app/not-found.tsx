import Link from "next/link";

export default function NotFound404() {
    return (
        <html lang="en">
            <body>
                <p>Page not found.</p>
                <Link href="/">Return Home</Link>
            </body>
        </html>
    );
}
