import { useMutation } from "@apollo/client";
import type { ApolloError } from "@apollo/client/errors";
import type { FetchResult } from "@apollo/client/link/core";

import type { BlockInterface } from "../blocks/types";
import type { GQLRedirectInput } from "../graphql.generated";
import {
    createRedirectMutation,
    type FormValues,
    type GQLCreateRedirectMutation,
    type GQLUpdateRedirectMutation,
    updateRedirectMutation,
} from "./RedirectForm";

const convertRedirectFormToApiInput = ({ sourceType, source, target, comment }: FormValues, linkBlock: BlockInterface): GQLRedirectInput => {
    const apiInput: GQLRedirectInput = {
        sourceType,
        source,
        target: linkBlock.state2Output(target),
        comment,
        generationType: "manual",
    };

    return apiInput;
};

export const useSubmitMutation = (
    mode: "edit" | "add",
    id: string | undefined,
    linkBlock: BlockInterface,
    scope: Record<string, unknown>,
): [
    (values: FormValues) => Promise<FetchResult<GQLCreateRedirectMutation | GQLUpdateRedirectMutation>>,
    { loading: boolean; error: ApolloError | undefined },
] => {
    const [create, { loading: createLoading, error: createError }] = useMutation<GQLCreateRedirectMutation>(createRedirectMutation);
    const [update, { loading: updateLoading, error: updateError }] = useMutation<GQLUpdateRedirectMutation>(updateRedirectMutation);
    const loading = mode === "edit" ? updateLoading : createLoading;
    const error = mode === "edit" ? updateError : createError;

    return [
        (values: FormValues) => {
            const mutation = mode === "edit" ? update : create;

            const input = convertRedirectFormToApiInput(values, linkBlock);

            return mutation({
                variables: {
                    scope: mode === "add" ? scope : undefined,
                    id,
                    input,
                    lastUpdatedAt: values.updatedAt,
                },
            });
        },
        { loading, error },
    ];
};
