import { redirect } from "@dextinity/site-react-router";

export function loader() {
    redirect("javascript:alert(1)");
}

export default function UnsafeRedirectPage() {
    return <h1>Never rendered</h1>;
}
