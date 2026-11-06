import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { MenuItem } from "@dextinity/ui";
import { useEffect } from "react";
import { Field, Form } from "react-final-form";
import { act, cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { useDextinityConfig } from "../../../config/DextinityConfigContext";
import { useContentScope } from "../../../contentScope/Provider";
import { useDependenciesConfig } from "../../../dependencies/dependenciesConfig";
import type { DamFilePickerDialogProps } from "../chooseFile/DamFilePickerDialog";
import { FileField } from "../FileField";
import type { GQLDamFileFieldFileFragment } from "../FileField.fragment.generated";

vi.mock("../../../config/DextinityConfigContext", () => ({ useDextinityConfig: vi.fn() }));
vi.mock("../../../contentScope/Provider", () => ({ useContentScope: vi.fn() }));
vi.mock("../../../dependencies/dependenciesConfig", () => ({ useDependenciesConfig: vi.fn() }));
vi.mock("../DamPathLazy", () => ({ DamPathLazy: ({ fileId }: { fileId: string }) => <>/path/of/{fileId}</> }));

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
        size: 1000,
        mimetype: "image/jpeg",
        contentHash: `${id}-hash`,
        title: null,
        altText: null,
        archived: false,
        folder: folderId != null ? { id: folderId } : null,
        fileUrl: `https://example.com/${name}`,
        image: null,
    };
}

function createClientReturning(data: Record<string, unknown>) {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(
            () =>
                new Observable((observer) => {
                    observer.next({ data });
                    observer.complete();
                }),
        ),
    });
}

const lake = createFile("lake", "lake.jpg", "nature");
const forest = createFile("forest", "forest.jpg");

function ValueSpy({ value, onValueChange }: { value: unknown; onValueChange: (value: unknown) => void }) {
    useEffect(() => onValueChange(value), [value, onValueChange]);
    return null;
}

function TestForm({
    initialValue,
    onValueChange,
    ...fieldProps
}: { initialValue?: unknown; onValueChange: (value: unknown) => void } & Record<string, unknown>) {
    return (
        <ApolloProvider client={createClientReturning({ damFile: { __typename: "DamFile", ...forest } })}>
            <Form onSubmit={() => {}} initialValues={{ file: initialValue }}>
                {({ values }) => (
                    <>
                        <ValueSpy value={values.file} onValueChange={onValueChange} />
                        <Field name="file" component={FileField} {...fieldProps} />
                    </>
                )}
            </Form>
        </ApolloProvider>
    );
}

describe("FileField", () => {
    beforeEach(() => {
        (useDextinityConfig as Mock).mockReturnValue({ dam: { scopeParts: ["domain"] } });
        (useContentScope as Mock).mockReturnValue({ scope: { domain: "main" }, match: { url: "/main" } });
        (useDependenciesConfig as Mock).mockReturnValue({ entityDependencyMap: {} });
    });

    afterEach(() => {
        cleanup();
        pickerDialogProps.current = undefined;
    });

    it("chooses a file in the picker", async () => {
        const onValueChange = vi.fn();
        render(<TestForm onValueChange={onValueChange} buttonText="Choose image" allowedMimetypes={["image/jpeg"]} />);

        fireEvent.click(screen.getByRole("button", { name: "Choose image" }));

        expect(screen.getByRole("dialog", { name: "Picker" })).toBeTruthy();
        expect(pickerDialogProps.current?.allowedMimetypes).toEqual(["image/jpeg"]);

        await act(() => pickerDialogProps.current?.onChoose(["forest"]));

        await waitFor(() => expect(screen.getByText("forest.jpg")).toBeTruthy());
        expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "forest" }));
        expect(screen.queryByRole("dialog", { name: "Picker" })).toBeNull();
    });

    it("shows the chosen file with its path, replaces it from its folder and empties it", () => {
        const onValueChange = vi.fn();
        render(<TestForm initialValue={lake} onValueChange={onValueChange} />);

        expect(screen.getByText("lake.jpg")).toBeTruthy();
        expect(screen.getByText("/path/of/lake")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Replace" }));

        expect(pickerDialogProps.current?.open).toBe(true);
        expect(pickerDialogProps.current?.initialFileIds).toEqual(["lake"]);
        expect(pickerDialogProps.current?.initialFolderId).toBe("nature");

        fireEvent.click(screen.getByRole("button", { name: "Empty" }));

        expect(onValueChange).toHaveBeenLastCalledWith(undefined);
        expect(screen.getByRole("button", { name: "Choose file" })).toBeTruthy();
    });

    it("offers the menu actions of the file", async () => {
        const onCrop = vi.fn();
        render(<TestForm initialValue={lake} onValueChange={vi.fn()} menuActions={[{ label: "Crop image", onClick: onCrop }, null]} />);

        fireEvent.click(screen.getByRole("button", { name: "More actions" }));
        fireEvent.click(await screen.findByRole("menuitem", { name: "Crop image" }));

        expect(onCrop).toHaveBeenCalled();
    });

    it("offers menu actions given as elements", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const onCrop = vi.fn();
        render(<TestForm initialValue={lake} onValueChange={vi.fn()} menuActions={[<MenuItem label="Crop image" onClick={onCrop} />]} />);

        fireEvent.click(screen.getByRole("button", { name: "More actions" }));
        fireEvent.click(await screen.findByRole("menuitem", { name: "Crop image" }));

        expect(onCrop).toHaveBeenCalled();
        expect(consoleError.mock.calls.flat().join(" ")).not.toContain('unique "key"');
        consoleError.mockRestore();
    });

    it("has no menu without actions or a DAM dependency", () => {
        render(<TestForm initialValue={lake} onValueChange={vi.fn()} />);

        expect(screen.queryByRole("button", { name: "More actions" })).toBeNull();
    });

    it("removes one of several files", () => {
        const onValueChange = vi.fn();
        render(<TestForm initialValue={[lake, forest]} onValueChange={onValueChange} multiple />);

        expect(screen.getByText("lake.jpg")).toBeTruthy();
        expect(screen.getByText("forest.jpg")).toBeTruthy();

        fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

        expect(onValueChange).toHaveBeenLastCalledWith([forest]);

        fireEvent.click(screen.getByRole("button", { name: "Change selected files" }));

        expect(pickerDialogProps.current?.multiple).toBe(true);
        expect(pickerDialogProps.current?.initialFileIds).toEqual(["forest"]);
        expect(pickerDialogProps.current?.initialFolderId).toBeNull();
    });
});
