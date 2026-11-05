export function loader() {
    return Response.json({ status: "OK" }, { headers: { "Cache-Control": "no-store" } });
}
