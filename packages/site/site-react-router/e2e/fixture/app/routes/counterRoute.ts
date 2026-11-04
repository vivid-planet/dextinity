let count = 0;

/**
 * An API whose responses change on every request, to test the fetch cache
 */
export function loader() {
    count++;
    return Response.json({ data: { count } });
}
