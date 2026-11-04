export function headers() {
    return { "Cache-Control": "public, s-maxage=60" };
}

export function meta() {
    return [{ title: "Cached" }];
}

export function ServerComponent() {
    return <h1>Cached page</h1>;
}
