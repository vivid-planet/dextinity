import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Field } from "../../field/Field";
import { FileUpload } from "../FileUpload";

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
});
