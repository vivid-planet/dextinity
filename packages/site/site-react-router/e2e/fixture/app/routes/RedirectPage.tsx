import { redirect } from "react-router";

export function loader() {
    return redirect("/cached", 307);
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
