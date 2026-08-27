import { gql, useApolloClient } from "@apollo/client";
import { ContentTranslationServiceProvider } from "@dextinity/admin";
import type { ComponentProps, PropsWithChildren } from "react";

import { useContentScope } from "../contentScope/Provider";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import type { GQLTranslateQuery, GQLTranslateQueryVariables } from "./AzureAiTranslatorProvider.generated";

interface AzureAiTranslatorProps extends Omit<ComponentProps<typeof ContentTranslationServiceProvider>, "enabled" | "translate" | "batchTranslate"> {
    enabled?: boolean;
}

export const AzureAiTranslatorProvider = ({ children, enabled = false, ...rest }: PropsWithChildren<AzureAiTranslatorProps>) => {
    const { scope } = useContentScope();
    const apolloClient = useApolloClient();
    const isAllowed = useUserPermissionCheck();

    return (
        <ContentTranslationServiceProvider
            {...rest}
            enabled={enabled && isAllowed("translation")}
            translate={async function (text: string): Promise<string> {
                const { data } = await apolloClient.query<GQLTranslateQuery, GQLTranslateQueryVariables>({
                    query: translationQuery,
                    variables: {
                        input: { text, targetLanguage: scope.language },
                    },
                });
                return data.azureAiTranslate;
            }}
            batchTranslate={async function (texts: string[]): Promise<string[]> {
                const { data } = await apolloClient.query<{ azureAiTranslateBatch: string[] }>({
                    query: batchTranslationQuery,
                    variables: {
                        input: { texts, targetLanguage: scope.language },
                    },
                    fetchPolicy: "no-cache",
                });
                return data.azureAiTranslateBatch;
            }}
        >
            {children}
        </ContentTranslationServiceProvider>
    );
};

const translationQuery = gql`
    query Translate($input: AzureAiTranslationInput!) {
        azureAiTranslate(input: $input)
    }
`;

const batchTranslationQuery = gql`
    query TranslateBatch($input: AzureAiTranslationBatchInput!) {
        azureAiTranslateBatch(input: $input)
    }
`;
