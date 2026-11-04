import { notFound } from "@dextinity/site-react-router";

export function loader() {
    notFound();
}

export default function NotFoundPage() {
    return <h1>Never rendered</h1>;
}
