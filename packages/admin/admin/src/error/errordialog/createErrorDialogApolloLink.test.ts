import { ApolloClient, ApolloLink, gql, InMemoryCache, Observable, ServerError } from "@apollo/client";
import { GraphQLError } from "graphql";
import { beforeEach, describe, expect, it } from "vitest";

import { createErrorDialogApolloLink } from "./createErrorDialogApolloLink";
import { errorDialogVar } from "./errorDialogVar";

const testQuery = gql`
    query Test {
        foo
    }
`;

async function executeQueryWithError({ errors, networkError, response }: { errors?: GraphQLError[]; networkError?: Error; response?: Response }) {
    const responseLink = new ApolloLink(
        (operation) =>
            new Observable<ApolloLink.Result>((observer) => {
                if (response) {
                    operation.setContext({ response });
                }
                if (networkError) {
                    observer.error(networkError);
                } else {
                    observer.next({ errors });
                    observer.complete();
                }
            }),
    );

    const client = new ApolloClient({
        link: ApolloLink.from([createErrorDialogApolloLink(), responseLink]),
        cache: new InMemoryCache(),
    });

    try {
        await client.query({ query: testQuery, fetchPolicy: "no-cache" });
    } catch {
        // The error is reported via errorDialogVar
    }
}

describe("createErrorDialogApolloLink", () => {
    beforeEach(() => {
        errorDialogVar(undefined);
    });

    it("shows the messages of GraphQL errors", async () => {
        await executeQueryWithError({
            errors: [
                new GraphQLError("Validation failed", { extensions: { code: "BAD_REQUEST" } }),
                new GraphQLError("Product not found", { extensions: { code: "BAD_REQUEST" } }),
            ],
        });

        expect(errorDialogVar()?.error).toEqual(["Validation failed", "Product not found"]);
        expect(errorDialogVar()?.additionalInformation?.errorType).toBe("graphql");
    });

    it("shows the message of a network error", async () => {
        await executeQueryWithError({ networkError: new Error("Failed to fetch") });

        expect(errorDialogVar()?.error).toBe("Failed to fetch");
        expect(errorDialogVar()?.additionalInformation?.errorType).toBe("network");
    });

    it("prioritizes GraphQL errors over the network error", async () => {
        const bodyText = JSON.stringify({ errors: [new GraphQLError("Validation failed", { extensions: { code: "BAD_REQUEST" } })] });
        const serverError = new ServerError("Response not successful: Received status code 400", {
            response: new Response(bodyText, { status: 400 }),
            bodyText,
        });

        await executeQueryWithError({ networkError: serverError });

        expect(errorDialogVar()?.error).toEqual(["Validation failed"]);
        expect(errorDialogVar()?.additionalInformation?.errorType).toBe("graphql");
        expect(errorDialogVar()?.additionalInformation?.httpStatus).toBe("400 Bad Request");
    });

    it("shows the HTTP status of a non-2xx response containing GraphQL errors", async () => {
        await executeQueryWithError({
            errors: [new GraphQLError("Not authenticated")],
            response: new Response(null, { status: 401 }),
        });

        expect(errorDialogVar()?.error).toEqual(["Not authenticated"]);
        expect(errorDialogVar()?.additionalInformation?.errorType).toBe("unauthenticated");
        expect(errorDialogVar()?.additionalInformation?.httpStatus).toBe("401 Unauthorized");
    });
});
