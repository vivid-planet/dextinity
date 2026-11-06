import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { useEffect } from "react";
import { Form } from "react-final-form";
import { act, cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DamFilePickerDialogProps } from "../chooseFile/DamFilePickerDialog";
import { DamFileField } from "../DamFileField";
import type { GQLDamFileFieldFileFragment } from "../FileField.fragment.generated";

const pickerDialogProps = vi.hoisted(() => ({ current: undefined as DamFilePickerDialogProps | undefined }));

vi.mock("../chooseFile/DamFilePickerDialog", () => ({
    DamFilePickerDialog: (props: DamFilePickerDialogProps) => {
        pickerDialogProps.current = props;
        return props.open ? <div role="dialog" aria-label="Picker" /> : null;
    },
}));

function createFile(id: string, name: string): GQLDamFileFieldFileFragment {
    return {
        id,
        name,
        size: 2_400_000,
        mimetype: "image/jpeg",
        contentHash: `${id}-hash`,
        title: null,
        altText: null,
        archived: false,
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
        image: file.image && { __typename: "DamFileImage", ...file.image, cropArea: { __typename: "ImageCropArea", ...file.image.cropArea } },
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

const lake = createFile("lake", "lake.jpg");
const forest = createFile("forest", "forest.jpg");

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
});
