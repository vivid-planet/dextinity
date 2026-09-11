import { gql, useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext, useErrorDialog } from "@dextinity/admin";
import { useCallback, useRef } from "react";
import { FormattedMessage } from "react-intl";

import { useContentLanguage } from "../../contentLanguage/useContentLanguage";
import { useContentScope } from "../../contentScope/Provider";
import { useContentGenerationConfig } from "../../documents/ContentGenerationConfigContext";
import type { GQLGenerateSeoTagsMutation, GQLGenerateSeoTagsMutationVariables } from "./useSeoTagGeneration.generated";

export function useSeoTagGeneration() {
    const contentGenerationConfig = useContentGenerationConfig();
    const errorDialog = useErrorDialog();
    const apolloClient = useApolloClient();
    const scope = useContentScope();
    const language = useContentLanguage(scope);

    const pendingRequest = useRef<{ content: string; request: Promise<GQLGenerateSeoTagsMutation["generateSeoTags"]> } | undefined>(undefined);
    const seoTagsCache = useRef<GQLGenerateSeoTagsMutation["generateSeoTags"] & { content: string }>({
        content: "",
        htmlTitle: "",
        metaDescription: "",
        openGraphTitle: "",
        openGraphDescription: "",
    });

    const getSeoTags = useCallback(
        async (content: string): Promise<GQLGenerateSeoTagsMutation["generateSeoTags"]> => {
            const { data, errors } = await apolloClient.mutate<GQLGenerateSeoTagsMutation, GQLGenerateSeoTagsMutationVariables>({
                mutation: generateSeoTagsMutation,
                variables: { content, language },
                context: LocalErrorScopeApolloContext,
                errorPolicy: "all",
            });

            if (errors || !data?.generateSeoTags) {
                errorDialog?.showError({
                    title: (
                        <FormattedMessage
                            id="dextinity.blocks.seo.generateSeoTags.errors.failed.title"
                            defaultMessage="Failed to generate SEO tags"
                        />
                    ),
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.blocks.seo.generateSeoTags.errors.failed.message"
                            defaultMessage="An error occurred while generating SEO tags. Please try again."
                        />
                    ),
                    error: errors ? errors[0].message : "Failed to generate SEO tags",
                });
                throw new Error("Failed to generate SEO tags");
            }

            return data.generateSeoTags;
        },
        [apolloClient, errorDialog, language],
    );

    // During each generateSeoTag request, all tags are generated and cached. The cache makes responses quicker by avoiding unnecessary requests and saves LLM tokens.
    const generateSeoTag = useCallback(
        async (tag: SeoTag, currentValue: string | undefined): Promise<string> => {
            const content = contentGenerationConfig?.seo?.getRelevantContent().join(" ");

            if (!content || content.length === 0) {
                errorDialog?.showError({
                    title: (
                        <FormattedMessage
                            id="dextinity.blocks.seo.generateSeoTags.errors.noContent.title"
                            defaultMessage="No content for generation"
                        />
                    ),
                    userMessage: (
                        <FormattedMessage
                            id="dextinity.blocks.seo.generateSeoTags.errors.noContent.message"
                            defaultMessage="This document contains no content that can be used to generate SEO information. Please add content and try again."
                        />
                    ),
                    error: "No content to generate SEO tags from",
                });
                return "";
            }

            const cacheForTagExists = !!seoTagsCache.current[tag];
            const currentValueDoesntEqualCachedValue = currentValue !== seoTagsCache.current[tag];
            const currentContentEqualsCachedContent = content === seoTagsCache.current.content;

            if (cacheForTagExists && currentValueDoesntEqualCachedValue && currentContentEqualsCachedContent) {
                return seoTagsCache.current[tag];
            }

            let seoTags: GQLGenerateSeoTagsMutation["generateSeoTags"];

            if (pendingRequest && pendingRequest.current?.content === content) {
                try {
                    seoTags = await pendingRequest.current?.request;
                } catch {
                    return "";
                }
                return seoTags[tag];
            }

            const request = getSeoTags(content);
            pendingRequest.current = { request, content };

            try {
                seoTags = await request;
            } catch (err) {
                console.error(err);
                pendingRequest.current = undefined;
                return "";
            }

            pendingRequest.current = undefined;
            seoTagsCache.current = { content, ...seoTags };
            return seoTags[tag];
        },
        [contentGenerationConfig?.seo, errorDialog, getSeoTags],
    );

    return generateSeoTag;
}

const generateSeoTagsMutation = gql`
    mutation GenerateSeoTags($content: String!, $language: String!) {
        generateSeoTags(content: $content, language: $language) {
            htmlTitle
            metaDescription
            openGraphTitle
            openGraphDescription
        }
    }
`;

export type SeoTag = "htmlTitle" | "metaDescription" | "openGraphTitle" | "openGraphDescription";
