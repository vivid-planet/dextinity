// Doesn't use the language layout, its data may be what failed to load
export default function ErrorPage() {
    return (
        <>
            <title>Something went wrong</title>
            <p>Something went wrong.</p>
            <a href="/">Return Home</a>
        </>
    );
}
