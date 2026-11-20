import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { FileUpload, type FileUploadFile } from "../FileUpload";

afterEach(cleanup);

describe("FileUpload", () => {
    it("follows the surrounding field and emits the owner state", () => {
        render(
            <Field label="Attachment" layout="group" required readOnly state="error" validationMessage="Attach the signed contract.">
                <FileUpload
                    value={[{ id: "1", name: "contract.pdf", size: 312_000 }]}
                    onChange={vi.fn()}
                    onUpload={vi.fn()}
                    multiple
                    name="attachments"
                />
            </Field>,
        );

        const group = screen.getByRole("group", { name: "Attachment" });
        expect(group.className).toContain("dextinityFileUpload");
        expect(group.dataset.invalid).toBe("");
        expect([group.dataset.multiple, group.dataset.required, group.dataset.readonly, group.hasAttribute("data-disabled")]).toStrictEqual([
            "",
            "",
            "",
            false,
        ]);
        expect(group).toHaveAccessibleDescription("Attach the signed contract. Required");
        expect(group.getAttribute("aria-invalid")).toBe("true");
        expect(group).not.toHaveAttribute("aria-required");
        expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
        expect(group.querySelector<HTMLInputElement>("input[type=hidden][name=attachments]")?.value).toBe("1");
    });

    it("takes its name from aria-label on its own", () => {
        render(<FileUpload aria-label="Attachment" value={[]} onChange={vi.fn()} onUpload={vi.fn()} />);

        expect(screen.getByRole("group", { name: "Attachment" })).toBeInTheDocument();
    });

    it("doesn't retry a failed upload once the limit is reached or the field turned read-only", async () => {
        const onUpload = vi
            .fn<(file: File) => Promise<FileUploadFile>>()
            .mockRejectedValueOnce(new Error("Network"))
            .mockImplementation(async (file) => ({ id: file.name, name: file.name, size: file.size }));

        function Upload({ readOnly }: { readOnly?: boolean }) {
            const [files, setFiles] = useState<FileUploadFile[]>([]);
            return (
                <FileUpload
                    aria-label="Attachments"
                    value={files}
                    onChange={setFiles}
                    onUpload={onUpload}
                    multiple
                    maxFiles={1}
                    readOnly={readOnly}
                />
            );
        }

        const { container, rerender } = render(<Upload />);
        const input = () => {
            const element = container.querySelector<HTMLInputElement>("input[type=file]");
            if (element == null) {
                throw new Error("The file input is missing.");
            }
            return element;
        };

        await act(async () => fireEvent.change(input(), { target: { files: [new File(["a"], "a.pdf")] } }));
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

        rerender(<Upload readOnly />);
        expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();

        rerender(<Upload />);
        await act(async () => fireEvent.change(input(), { target: { files: [new File(["b"], "b.pdf")] } }));
        expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
        expect(onUpload).toHaveBeenCalledTimes(2);
    });
});
