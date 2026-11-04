// Operations are top-level definitions, so they start the document or follow the end of the previous definition
const mutationOrSubscriptionRegex = /(^|})[\s,]*(mutation|subscription)\b/;

/**
 * Queries don't have side effects, but mutations and subscriptions do.
 * A field named like an operation type may be mistaken for one, which only treats the query as having side effects.
 */
export function isGraphQLQuery(document: string) {
    const documentWithoutComments = document.replace(/#[^\n\r]*/g, "");
    return !mutationOrSubscriptionRegex.test(documentWithoutComments);
}

function getPostedQuery(body: Uint8Array<ArrayBuffer>): string | undefined {
    try {
        const { query } = JSON.parse(new TextDecoder().decode(body)) as { query?: unknown };
        return typeof query === "string" ? query : undefined;
    } catch {
        return undefined;
    }
}

/**
 * GraphQL queries can be memoized also when sent with `POST`, as they don't have side effects
 */
export function isGraphQLQueryRequest(request: Request, body: Uint8Array<ArrayBuffer>): boolean {
    if (request.method === "GET" || request.method === "HEAD") {
        const query = new URL(request.url).searchParams.get("query");
        return query === null || isGraphQLQuery(query);
    }
    if (request.method !== "POST") {
        return false;
    }
    const query = getPostedQuery(body);
    return query !== undefined && isGraphQLQuery(query);
}
