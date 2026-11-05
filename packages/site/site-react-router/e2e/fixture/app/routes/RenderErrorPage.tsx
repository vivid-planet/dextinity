async function FailingComponent(): Promise<never> {
    throw new Error("Server component failed");
}

export function ServerComponent() {
    return (
        <>
            <h1>Render error</h1>
            <FailingComponent />
        </>
    );
}
