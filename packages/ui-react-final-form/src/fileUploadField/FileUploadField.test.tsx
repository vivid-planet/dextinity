import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "react-final-form";
import { describe, expect, it, vi } from "vitest";

import { focusOnError } from "../focusOnError/focusOnError";
import { FileUploadField, toFileUploadValue } from "./FileUploadField";

describe("FileUploadField", () => {
    it("maps the field value to a list", () => {
        const file = { id: "1", name: "a.pdf" };
        expect(toFileUploadValue(undefined)).toEqual([]);
        expect(toFileUploadValue("")).toEqual([]);
        expect(toFileUploadValue(file)).toEqual([file]);
        expect(toFileUploadValue([file])).toEqual([file]);
    });

    it("requires an uploaded file and writes the uploaded files to the form", async () => {
        const onSubmit = vi.fn();
        const onUpload = vi.fn(async (file: File) => ({ id: "42", name: file.name }));
        render(
            <Form onSubmit={onSubmit} decorators={[focusOnError]}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} noValidate>
                        <FileUploadField name="contract" label="Contract" onUpload={onUpload} required requiredMessage="Attach the contract" />
                        <button type="submit">Save</button>
                    </form>
                )}
            </Form>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(screen.getByRole("group", { name: "Contract" })).toHaveAccessibleDescription("Attach the contract");
        expect(screen.getByRole("button", { name: "choose files" })).toHaveFocus();

        const input = document.querySelector<HTMLInputElement>("input[type=file]");
        await userEvent.upload(input as HTMLInputElement, new File(["%PDF"], "contract.pdf", { type: "application/pdf" }));
        await waitFor(() => expect(screen.getByText("contract.pdf")).toBeInTheDocument());
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        expect(onSubmit).toHaveBeenCalledWith({ contract: [{ id: "42", name: "contract.pdf" }] }, expect.anything(), expect.anything());
    });
});
