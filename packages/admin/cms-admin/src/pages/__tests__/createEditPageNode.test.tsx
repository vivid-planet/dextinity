import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { useContentTranslationService } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";
import { cleanup, fireEvent, render, screen, waitFor, within } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import type { DocumentInterface } from "../../documents/types";
import { createEditPageNode, type EditPageNodeProps } from "../createEditPageNode";

vi.mock("@dextinity/admin", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@dextinity/admin")>()),
    useContentTranslationService: vi.fn(),
}));
vi.mock("../config/usePageTreeScope", () => ({ usePageTreeScope: () => ({ domain: "main", language: "en" }) }));
vi.mock("../../contentLanguage/useContentLanguage", () => ({ useContentLanguage: () => "en" }));
vi.mock("../../redirects/redirectsConfig", () => ({ useRedirectsScope: () => ({ domain: "main" }) }));

const documentTypes = {
    Page: { displayName: <FormattedMessage id="test.documentType.page" defaultMessage="Page" /> },
    ExternalLink: { displayName: <FormattedMessage id="test.documentType.link" defaultMessage="Link" /> },
} as unknown as Record<string, DocumentInterface>;

interface Operation {
    operationName: string;
    variables: Record<string, unknown>;
}

function createClient(operations: Operation[]) {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(
            (operation) =>
                new Observable((observer) => {
                    operations.push({ operationName: operation.operationName, variables: operation.variables });
                    if (operation.operationName === "IsPathAvailable") {
                        observer.next({ data: { availability: "Available" } });
                    } else if (operation.operationName === "CreatePageNode") {
                        observer.next({ data: { createPageTreeNode: { __typename: "PageTreeNode", id: "new-page" } } });
                    } else {
                        observer.next({ data: {} });
                    }
                    observer.complete();
                }),
        ),
    });
}

const EditPageNode = createEditPageNode({});

function renderDialog(props: Partial<EditPageNodeProps> = {}) {
    const operations: Operation[] = [];
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();
    render(
        <ApolloProvider client={createClient(operations)}>
            <EditPageNode
                open
                onOpenChange={onOpenChange}
                mode="add"
                category="mainNavigation"
                documentTypes={documentTypes}
                onSaved={onSaved}
                {...props}
            />
        </ApolloProvider>,
    );
    return { operations, onSaved, onOpenChange };
}

describe("createEditPageNode", () => {
    beforeEach(() => {
        (useContentTranslationService as Mock).mockReturnValue({ enabled: false });
    });

    afterEach(() => {
        cleanup();
    });

    it("creates a page with the slug derived from its name", async () => {
        const { operations, onSaved, onOpenChange } = renderDialog({ initialValues: { parent: null, pos: 2 } });

        fireEvent.change(screen.getByRole("textbox", { name: /Name/ }), { target: { value: "About us" } });

        const slugInput = screen.getByRole("textbox", { name: /Slug/ });
        await waitFor(() => expect(slugInput).toHaveProperty("value", "about-us"));
        expect(screen.getByText("Complete path: /about-us")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Create" }));

        await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: "new-page" }));
        const createOperation = operations.find((operation) => operation.operationName === "CreatePageNode");
        expect(createOperation?.variables).toMatchObject({
            input: { name: "About us", slug: "about-us", parentId: null, pos: 2, attachedDocument: { type: "Page" } },
            contentScope: { domain: "main", language: "en" },
            category: "mainNavigation",
        });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("keeps a slug that was changed by hand when the name changes", async () => {
        renderDialog();

        const nameInput = screen.getByRole("textbox", { name: /Name/ });
        const slugInput = screen.getByRole("textbox", { name: /Slug/ });
        fireEvent.change(nameInput, { target: { value: "About" } });
        await waitFor(() => expect(slugInput).toHaveProperty("value", "about"));

        fireEvent.input(slugInput, { target: { value: "team" } });
        fireEvent.change(nameInput, { target: { value: "About us" } });

        await waitFor(() => expect(slugInput).toHaveProperty("value", "team"));
    });

    it("rejects a slug with forbidden symbols", async () => {
        const { operations } = renderDialog();

        fireEvent.change(screen.getByRole("textbox", { name: /Name/ }), { target: { value: "About" } });
        const slugInput = screen.getByRole("textbox", { name: /Slug/ });
        fireEvent.input(slugInput, { target: { value: "about us!" } });
        fireEvent.blur(slugInput);
        fireEvent.click(screen.getByRole("button", { name: "Create" }));

        expect(await screen.findByText("Slug contains forbidden symbols")).toBeTruthy();
        expect(operations.some((operation) => operation.operationName === "CreatePageNode")).toBe(false);
    });

    it("chooses the document type by typing its translated label", async () => {
        const { operations } = renderDialog();

        const documentTypeSelect = screen.getByRole("combobox", { name: /Document type/ });
        expect(documentTypeSelect.textContent).toContain("Page");

        documentTypeSelect.focus();
        fireEvent.click(documentTypeSelect);
        const listbox = await screen.findByRole("listbox");
        expect(
            within(listbox)
                .getAllByRole("option")
                .map((option) => option.textContent),
        ).toEqual(["Page", "Link"]);
        fireEvent.keyDown(listbox, { key: "l" });
        await waitFor(() => expect(document.activeElement?.textContent).toBe("Link"));
        fireEvent.click(document.activeElement as HTMLElement);
        await waitFor(() => expect(documentTypeSelect.textContent).toContain("Link"));

        fireEvent.change(screen.getByRole("textbox", { name: /Name/ }), { target: { value: "Contact" } });
        await waitFor(() => expect(screen.getByRole("textbox", { name: /Slug/ })).toHaveProperty("value", "contact"));
        fireEvent.click(screen.getByRole("button", { name: "Create" }));
        await waitFor(() =>
            expect(operations.find((operation) => operation.operationName === "CreatePageNode")?.variables).toMatchObject({
                input: { attachedDocument: { type: "ExternalLink" } },
            }),
        );
    });

    it("translates the slug and keeps it a slug", async () => {
        const translate = vi.fn(async () => "About us");
        (useContentTranslationService as Mock).mockReturnValue({ enabled: true, translate, showApplyTranslationDialog: false });
        renderDialog();

        fireEvent.change(screen.getByRole("textbox", { name: /Name/ }), { target: { value: "Über uns" } });
        const slugInput = screen.getByRole("textbox", { name: /Slug/ });
        await waitFor(() => expect(slugInput).toHaveProperty("value", "uber-uns"));

        const [, slugTranslateButton] = screen.getAllByRole("button", { name: "Translate" });
        fireEvent.click(slugTranslateButton);

        await waitFor(() => expect(slugInput).toHaveProperty("value", "about-us"));
        expect(translate).toHaveBeenCalledWith("uber uns");
    });
});
