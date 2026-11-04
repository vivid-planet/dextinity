export function loader(): never {
    throw new Error("Loader failed");
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
