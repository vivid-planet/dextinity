export function loader() {
    return Response.json({ status: "OK" }, { headers: { "cache-control": "no-store" } });
}
