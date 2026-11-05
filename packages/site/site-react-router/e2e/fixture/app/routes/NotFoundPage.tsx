import { data } from "react-router";

export function loader() {
    throw data(null, { status: 404 });
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
