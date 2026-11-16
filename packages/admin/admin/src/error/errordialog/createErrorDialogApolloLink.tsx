import { CombinedGraphQLErrors, type ErrorLike, ServerError } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import type { GraphQLFormattedError } from "graphql";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

import type { ErrorType } from "./ErrorDialog";
import { errorDialogVar } from "./errorDialogVar";
import { ErrorScope, errorScopeForOperationContext } from "./ErrorScope";

export const createErrorDialogApolloLink = (config?: { signInUrl?: string }) => {
    return new ErrorLink(({ error: apolloError, operation }) => {
        const errorScope = errorScopeForOperationContext(operation.getContext());

        if (errorScope !== ErrorScope.Global) {
            return;
        }

        let error: string | string[] | undefined;
        let errorType: ErrorType | undefined;
        let httpStatus: string | undefined;

        const graphQLErrors = getGraphQLErrors(apolloError);

        if (graphQLErrors?.length) {
            error = graphQLErrors.map(({ message }) => message);

            if (graphQLErrors.some((e) => e.extensions?.code === "FORBIDDEN")) {
                errorType = "unauthenticated"; // Error is triggered by Dextinity Guard
            } else if (graphQLErrors.some((e) => e.extensions?.code === "UNAUTHENTICATED")) {
                errorType = "unauthorized"; // Error is triggered by UnauthorizedException
            } else {
                errorType = "graphql";
            }
        }

        if (!CombinedGraphQLErrors.is(apolloError)) {
            // Prioritize GraphQL error over network error
            if (!error) {
                error = apolloError.message;
                errorType = "network";
            }
        }

        // Apollo Client 4 doesn't throw a ServerError for non-2xx responses with content type application/graphql-response+json
        const response: unknown = operation.getContext().response;
        const statusCode = ServerError.is(apolloError)
            ? apolloError.statusCode
            : response instanceof Response && !response.ok
              ? response.status
              : undefined;
        if (statusCode !== undefined) {
            httpStatus = `${statusCode} ${getReasonPhrase(statusCode)}`;
            if (statusCode === StatusCodes.UNAUTHORIZED) {
                errorType = "unauthenticated"; // Error is triggered by AuthProxy
            }
        }

        errorDialogVar({
            error: error ?? "Unknown error",
            additionalInformation: {
                timestamp: new Date().toISOString(),
                errorType: errorType ?? "unknown",
                httpStatus,
                url: window.location.href,
            },
        });
    });
};

function getGraphQLErrors(error: ErrorLike): ReadonlyArray<GraphQLFormattedError> | undefined {
    if (CombinedGraphQLErrors.is(error)) {
        return error.errors;
    }
    if (ServerError.is(error)) {
        return parseGraphQLErrorsFromBody(error.bodyText);
    }
    return undefined;
}

function parseGraphQLErrorsFromBody(bodyText: string): GraphQLFormattedError[] | undefined {
    try {
        const body: unknown = JSON.parse(bodyText);
        if (typeof body === "object" && body !== null && "errors" in body && Array.isArray(body.errors)) {
            return body.errors;
        }
    } catch {
        // Body is not valid JSON
    }
    return undefined;
}
