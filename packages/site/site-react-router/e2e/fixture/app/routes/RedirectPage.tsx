import { redirect } from "@dextinity/site-react-router";

export function loader() {
    redirect("/cached", { headers: { "Cache-Control": "public, s-maxage=60" } });
}

export function ServerComponent() {
    return <h1>Never rendered</h1>;
}
