import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dropzone } from "../Dropzone";

afterEach(cleanup);

describe("Dropzone", () => {
    it("emits overlay, disabled, and error as data attributes", () => {
        const { container } = render(
            <>
                <Dropzone onFiles={vi.fn()} />
                <Dropzone onFiles={vi.fn()} overlay disabled error="Too large" />
            </>,
        );
        const [plain, flagged] = Array.from(container.children) as HTMLElement[];

        expect(plain.className).toContain("dextinityDropzone");
        expect(["overlay", "disabled", "error"].map((key) => plain.hasAttribute(`data-${key}`))).toStrictEqual([false, false, false]);
        expect(["overlay", "disabled", "error"].map((key) => flagged.hasAttribute(`data-${key}`))).toStrictEqual([true, true, true]);
    });

    it("marks each upload with its status", () => {
        const { container } = render(
            <Dropzone
                onFiles={vi.fn()}
                uploads={[
                    { id: "1", name: "a.jpg", progress: 0.5 },
                    { id: "2", name: "b.jpg", progress: 1, status: "done" },
                ]}
            />,
        );

        const statuses = Array.from(container.querySelectorAll<HTMLElement>(".dextinityDropzone__upload")).map((upload) => upload.dataset.status);
        expect(statuses).toStrictEqual(["uploading", "done"]);
    });
});
