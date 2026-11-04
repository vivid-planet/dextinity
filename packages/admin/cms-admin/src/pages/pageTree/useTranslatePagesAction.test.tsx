import type { ApolloClient } from "@apollo/client";
import { ContentTranslationServiceProvider } from "@dextinity/admin";
import { parse } from "graphql";
import { fireEvent, render, screen, waitFor } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { DextinityConfigProvider } from "../../config/DextinityConfigContext";
import type { DocumentInterface } from "../../documents/types";
import type { TranslatableInterface } from "../../translation/TranslatableInterface";
import type { PageTreePage } from "./usePageTree";
import { useTranslatePagesAction } from "./useTranslatePagesAction";

const mockMutate = vi.fn();

vi.mock(import("@apollo/client"), async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
        ...originalModule,
        useApolloClient: () =>
            ({
                // The page has no document, so only its name is translated, and the translated slug is available.
                query: async () => ({ data: { page: { document: null }, pageTreeNodeSlugAvailable: "Available" } }),
                mutate: mockMutate,
                refetchQueries: vi.fn(),
            }) as unknown as ApolloClient<object>,
    };
});

// A scope without a `language` dimension: the slug language can only come from the contentLanguage config.
vi.mock("../../contentScope/Provider", () => ({
    useContentScope: () => ({ scope: { domain: "main" } }),
}));

const page = { id: "page-1", name: "About us", slug: "about-us", parentId: null, documentType: "Page", visibility: "Published" } as PageTreePage;

// Apollo is mocked, so the documents are never executed. They only make the document type translatable.
const documentType = {
    getQuery: parse("{ __typename }"),
    updateMutation: parse("{ __typename }"),
    translateContent: async (input: Record<string, unknown>) => input,
} as unknown as DocumentInterface & TranslatableInterface;

function TranslatePagesAction() {
    const { dialogs, openDialog } = useTranslatePagesAction({ pages: [page], documentTypes: { Page: documentType } });

    return (
        <>
            <button onClick={openDialog}>Open translate dialog</button>
            {dialogs}
        </>
    );
}

describe("useTranslatePagesAction", () => {
    it("slugifies the translated page name with the content language of the scope", async () => {
        render(
            <DextinityConfigProvider apiUrl="" graphQLApiUrl="" adminUrl="" contentLanguage={{ resolveContentLanguageForScope: () => "de" }}>
                <ContentTranslationServiceProvider enabled translate={async () => "Über uns"}>
                    <TranslatePagesAction />
                </ContentTranslationServiceProvider>
            </DextinityConfigProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Open translate dialog" }));
        fireEvent.click(await screen.findByRole("button", { name: "Translate" }));

        // Without the German locale, slugify would produce "uber-uns".
        await waitFor(() =>
            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({ variables: { id: "page-1", input: { name: "Über uns", slug: "ueber-uns" } } }),
            ),
        );
    });
});
