import { notFound } from "@dextinity/site-react-router";

export function loader() {
    notFound();
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
