export function loader(): never {
    throw new Error("Server error of the test app");
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
