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
