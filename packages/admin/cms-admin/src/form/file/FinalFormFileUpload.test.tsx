import { Field, Form } from "react-final-form";
import { fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DextinityConfigProvider } from "../../config/DextinityConfigContext";
import { FinalFormFileUpload } from "./FinalFormFileUpload";

function renderFileUpload() {
    return render(
        <DextinityConfigProvider apiUrl="http://localhost" graphQLApiUrl="http://localhost/graphql" adminUrl="http://localhost">
            <Form onSubmit={() => {}} render={() => <Field name="file" component={FinalFormFileUpload} />} />
        </DextinityConfigProvider>,
    );
}

async function dropFile(container: HTMLElement) {
    const input = container.querySelector<HTMLInputElement>("input[type=file]");
    if (!input) {
        throw new Error("File input not found");
    }
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
}

describe("FinalFormFileUpload", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            },
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("shows an error instead of loading forever when the upload request fails on the network level", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

        const { container } = renderFileUpload();
        await dropFile(container);

        await waitFor(() => expect(screen.getByText("Upload failed.")).toBeTruthy());
    });

    it("shows an error when the upload response isn't JSON", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 })));

        const { container } = renderFileUpload();
        await dropFile(container);

        await waitFor(() => expect(screen.getByText("Upload failed.")).toBeTruthy());
    });
});
