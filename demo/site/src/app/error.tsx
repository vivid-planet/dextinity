import { DefaultTitle } from "@src/layout/DefaultTitle";

// Doesn't use the language layout, its data may be what failed to load
export default function ErrorPage() {
    return (
        <>
            <DefaultTitle />
            <p>Something went wrong.</p>
            <a href="/">Return Home</a>
        </>
    );
}
