import type { ApolloClient } from "@apollo/client";
import { useContentTranslationService } from "@dextinity/admin";
import { act, cleanup, render } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DextinityConfigProvider } from "../config/DextinityConfigContext";
import { AzureAiTranslatorProvider } from "./AzureAiTranslatorProvider";

const mockQuery = vi.fn().mockResolvedValue({ data: {} });

vi.mock(import("@apollo/client"), async (importOriginal) => {
    const originalModule = await importOriginal();
    return { ...originalModule, useApolloClient: () => ({ query: mockQuery }) as unknown as ApolloClient<object> };
});

// A scope without a `language` dimension: the target language can only come from the contentLanguage config.
vi.mock("../contentScope/Provider", () => ({
    useContentScope: () => ({ scope: { domain: "main" } }),
}));

vi.mock("../userPermissions/hooks/currentUser", () => ({
    useUserPermissionCheck: () => () => true,
}));

let contentTranslationService: ReturnType<typeof useContentTranslationService>;

function ContentTranslationServiceConsumer() {
    contentTranslationService = useContentTranslationService();
    return null;
}

function renderTranslatorProvider() {
    render(
        <DextinityConfigProvider apiUrl="" graphQLApiUrl="" adminUrl="" contentLanguage={{ resolveContentLanguageForScope: () => "de" }}>
            <AzureAiTranslatorProvider enabled>
                <ContentTranslationServiceConsumer />
            </AzureAiTranslatorProvider>
        </DextinityConfigProvider>,
    );
}

describe("AzureAiTranslatorProvider", () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("translates into the content language of the scope", async () => {
        renderTranslatorProvider();

        await act(async () => {
            await contentTranslationService.translate("Hello");
        });

        expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ variables: { input: { text: "Hello", targetLanguage: "de" } } }));
    });

    it("batch translates into the content language of the scope", async () => {
        renderTranslatorProvider();

        await act(async () => {
            await contentTranslationService.batchTranslate?.(["Hello"]);
        });

        expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ variables: { input: { texts: ["Hello"], targetLanguage: "de" } } }));
    });
});
