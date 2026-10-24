import { DefaultTitle } from "@src/layout/DefaultTitle";

export default function NotFound404() {
    return (
        <>
            <DefaultTitle />
            <p>Page not found.</p>
            <a href="/">Return Home</a>
        </>
    );
}
