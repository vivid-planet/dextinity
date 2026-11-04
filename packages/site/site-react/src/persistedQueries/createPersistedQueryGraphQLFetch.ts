import type { GraphQLFetch } from "../graphQLFetch/graphQLFetch";

type Fetch = typeof fetch;

export function createPersistedQueryGraphQLFetch(fetch: Fetch, url: string): GraphQLFetch {
    return async function <T, V>(query: string | { hash: string }, variables?: V, init?: RequestInit): Promise<T> {
        if (typeof query === "string") {
            throw new Error("at runtime only hashed queries are supported");
        }
        const hash = query.hash;
        let response;
        if (init?.method === "GET") {
            const fetchUrl = new URL(url, window.location.origin);
            fetchUrl.searchParams.append("extensions.persistedQuery.sha256Hash", hash);
            fetchUrl.searchParams.append("variables", JSON.stringify(variables));
            response = await fetch(fetchUrl, {
                ...init,
                headers: {
                    /**
                     * It's recommended to add the `Apollo-Require-Preflight` header to GET requests, running on an Apollo Server 4.
                     *
                     * If this header is missing, Apollo Server 4 will return: This operation has been blocked as a potential Cross-Site Request Forgery (CSRF).
                     *
                     * see: https://www.apollographql.com/docs/graphos/routing/security/csrf#enable-csrf-prevention
                     */
                    "Apollo-Require-Preflight": "true",
                    ...init.headers,
                },
            });
        } else {
            response = await fetch(url, {
                method: "POST",
                ...init,
                headers: { "Content-Type": "application/json", ...init?.headers },
                body: JSON.stringify({
                    extensions: {
                        persistedQuery: {
                            version: 1,
                            sha256Hash: hash,
                        },
                    },
                    variables,
                }),
            });
        }
        if (!response.ok) {
            let errorMessage = `Network response was not ok. Status: ${response.status}`;
            const body = await response.text();

            try {
                const json = JSON.parse(body);

                const { errors } = json;
                if (errors) {
                    errorMessage += `\n\nGraphQL error(s):\n- ${errors.map((error: { message: string }) => error.message).join("\n- ")}`;
                }
            } catch {
                errorMessage += `\n${body}`;
            }

            throw new Error(errorMessage);
        }

        const { data, errors } = await response.json();

        if (errors) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            throw new Error(`GraphQL error(s):\n- ${errors.map((error: any) => error.message).join("\n- ")}`);
        }

        return data;
    };
}
