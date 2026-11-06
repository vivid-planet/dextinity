import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FileUpload } from "./FileUpload";

afterEach(cleanup);

describe("FileUpload", () => {
    it("emits the owner state and connects the label and message to the group", () => {
        render(
            <FileUpload
                label="Attachment"
                value={[{ id: "1", name: "contract.pdf", size: 312_000 }]}
                onChange={vi.fn()}
                onUpload={vi.fn()}
                multiple
                required
                readOnly
                state="error"
                validationMessage="Attach the signed contract."
                name="attachments"
            />,
        );

        const group = screen.getByRole("group", { name: "Attachment" });
        expect(group.className).toContain("dextinityFileUpload");
        expect(group.dataset.state).toBe("error");
        expect([group.dataset.multiple, group.dataset.required, group.dataset.readonly, group.hasAttribute("data-disabled")]).toStrictEqual([
            "",
            "",
            "",
            false,
        ]);
        expect(group).toHaveAccessibleDescription("Attach the signed contract.");
        expect(group.getAttribute("aria-invalid")).toBe("true");
        expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
        expect(group.querySelector<HTMLInputElement>("input[type=hidden][name=attachments]")?.value).toBe("1");
    });
});
