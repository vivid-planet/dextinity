import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { useEffect } from "react";
import { Form } from "react-final-form";
import { act, cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { useDextinityConfig } from "../../../config/DextinityConfigContext";
import { useContentScope } from "../../../contentScope/Provider";
import type { DamFilePickerDialogProps } from "../chooseFile/DamFilePickerDialog";
import { DamFileField } from "../DamFileField";
import type { GQLDamFileFieldFileFragment } from "../FileField.fragment.generated";

vi.mock("../../../config/DextinityConfigContext", () => ({ useDextinityConfig: vi.fn() }));
vi.mock("../../../contentScope/Provider", () => ({ useContentScope: vi.fn() }));

const pickerDialogProps = vi.hoisted(() => ({ current: undefined as DamFilePickerDialogProps | undefined }));

vi.mock("../chooseFile/DamFilePickerDialog", () => ({
    DamFilePickerDialog: (props: DamFilePickerDialogProps) => {
        pickerDialogProps.current = props;
        return props.open ? <div role="dialog" aria-label="Picker" /> : null;
    },
}));

function createFile(id: string, name: string, folderId: string | null = null): GQLDamFileFieldFileFragment {
    return {
        id,
        name,
        size: 2_400_000,
        mimetype: "image/jpeg",
        contentHash: `${id}-hash`,
        title: null,
        altText: null,
        archived: false,
        folder: folderId != null ? { id: folderId } : null,
        fileUrl: `https://example.com/${name}`,
        image: {
            width: 800,
            height: 600,
            thumbnailUrl: `https://example.com/thumbnail/${name}`,
            cropArea: { focalPoint: "SMART", width: null, height: null, x: null, y: null },
        },
    };
}

function withTypenames(file: GQLDamFileFieldFileFragment) {
    return {
        __typename: "DamFile",
        ...file,
        folder: file.folder && { __typename: "DamFolder", ...file.folder },
        image: file.image && { __typename: "DamFileImage", ...file.image, cropArea: { __typename: "ImageCropArea", ...file.image.cropArea } },
    };
}

function createClientReturning(data: Record<string, unknown>, onRequest?: (variables: Record<string, unknown>) => void) {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(
            (operation) =>
                new Observable((observer) => {
                    onRequest?.(operation.variables);
                    observer.next({ data });
                    observer.complete();
                }),
        ),
    });
}

function createFailingClient() {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(() => new Observable((observer) => observer.error(new Error("Network error")))),
    });
}

const lake = createFile("lake", "lake.jpg");
const forest = createFile("forest", "forest.jpg");
const boat = createFile("boat", "boat.jpg", "harbor");

function TestForm({
    initialValue,
    multiple,
    onValueChange,
}: {
    initialValue?: unknown;
    multiple?: boolean;
    onValueChange: (value: unknown) => void;
}) {
    return (
        <Form onSubmit={() => {}} initialValues={{ file: initialValue }}>
            {({ values }) => (
                <>
                    <ValueSpy value={values.file} onValueChange={onValueChange} />
                    {multiple ? <DamFileField name="file" label="Images" multiple /> : <DamFileField name="file" label="Image" />}
                </>
            )}
        </Form>
    );
}

function ValueSpy({ value, onValueChange }: { value: unknown; onValueChange: (value: unknown) => void }) {
    useEffect(() => onValueChange(value), [value, onValueChange]);
    return null;
}

describe("DamFileField", () => {
    beforeEach(() => {
        (useDextinityConfig as Mock).mockReturnValue({ dam: { scopeParts: ["domain"] } });
        (useContentScope as Mock).mockReturnValue({ scope: { domain: "main", language: "en" } });
    });

    afterEach(() => {
        cleanup();
        pickerDialogProps.current = undefined;
    });

    it("shows the chosen file's name, format and size and clears it", () => {
        const onValueChange = vi.fn();
        render(
            <MockedProvider>
                <TestForm initialValue={lake} onValueChange={onValueChange} />
            </MockedProvider>,
        );

        expect(screen.getByText("lake.jpg")).toBeTruthy();
        expect(screen.getByText("JPG · 2.4 MB")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Empty" }));

        expect(onValueChange).toHaveBeenLastCalledWith(null);
        expect(screen.getByText("Choose file")).toBeTruthy();
    });

    it("sets the file chosen in the picker", async () => {
        const onValueChange = vi.fn();
        render(
            <ApolloProvider client={createClientReturning({ damFile: withTypenames(forest) })}>
                <TestForm initialValue={lake} onValueChange={onValueChange} />
            </ApolloProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Image/ }));

        expect(screen.getByRole("dialog", { name: "Picker" })).toBeTruthy();
        expect(pickerDialogProps.current?.initialFileIds).toEqual(["lake"]);
        expect(pickerDialogProps.current?.multiple).toBeUndefined();

        await act(() => pickerDialogProps.current?.onChoose(["forest"]));

        await waitFor(() => expect(screen.getByText("forest.jpg")).toBeTruthy());
        expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "forest" }));
        expect(screen.queryByRole("dialog", { name: "Picker" })).toBeNull();
    });

    it("opens the picker in the folder of the chosen file", () => {
        render(
            <MockedProvider>
                <TestForm initialValue={boat} onValueChange={vi.fn()} />
            </MockedProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Image/ }));

        expect(pickerDialogProps.current?.initialFolderId).toBe("harbor");
    });

    it("opens the picker in the root folder for a file in the root", () => {
        render(
            <MockedProvider>
                <TestForm initialValue={lake} onValueChange={vi.fn()} />
            </MockedProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Image/ }));

        expect(pickerDialogProps.current?.initialFolderId).toBeNull();
    });

    it("lets the picker look up the folder of a file loaded without it", () => {
        const { folder: _folder, ...lakeWithoutFolder } = lake;
        render(
            <MockedProvider>
                <TestForm initialValue={lakeWithoutFolder} onValueChange={vi.fn()} />
            </MockedProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Image/ }));

        expect(pickerDialogProps.current?.initialFolderId).toBeUndefined();
    });

    it("shows the number of files with multiple", () => {
        render(
            <MockedProvider>
                <TestForm initialValue={[lake, forest]} multiple onValueChange={vi.fn()} />
            </MockedProvider>,
        );

        expect(screen.getByText("2 files")).toBeTruthy();
        expect(screen.getByText("lake.jpg, forest.jpg")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: /^Images/ }));

        expect(pickerDialogProps.current?.multiple).toBe(true);
        expect(pickerDialogProps.current?.initialFileIds).toEqual(["lake", "forest"]);
    });

    it("loads the files chosen with multiple in the DAM scope of the content scope", async () => {
        const onValueChange = vi.fn();
        const onRequest = vi.fn();
        render(
            <ApolloProvider
                client={createClientReturning(
                    { damFilesList: { __typename: "PaginatedDamFiles", nodes: [withTypenames(forest), withTypenames(lake)] } },
                    onRequest,
                )}
            >
                <TestForm initialValue={[]} multiple onValueChange={onValueChange} />
            </ApolloProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Images/ }));
        await act(() => pickerDialogProps.current?.onChoose(["lake", "forest"]));

        expect(onRequest).toHaveBeenCalledWith(expect.objectContaining({ ids: ["lake", "forest"], scope: { domain: "main" } }));
        await waitFor(() =>
            expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "lake" }), expect.objectContaining({ id: "forest" })]),
        );
    });

    it("keeps the value and shows an error when the chosen file can't be loaded", async () => {
        const onValueChange = vi.fn();
        render(
            <ApolloProvider client={createFailingClient()}>
                <TestForm initialValue={lake} onValueChange={onValueChange} />
            </ApolloProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: /^Image/ }));
        await act(() => pickerDialogProps.current?.onChoose(["forest"]));

        expect(screen.getByText("Failed to load the selected file. Please try again.")).toBeTruthy();
        expect(screen.queryByRole("dialog", { name: "Picker" })).toBeNull();
        expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "lake" }));
    });
});
