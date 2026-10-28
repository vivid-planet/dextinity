import { afterEach, describe, expect, it, vi } from "vitest";

import { replaceByFilenameAndFolder, replaceById, upload } from "./upload";

const file = new File(["content"], "image.jpg", { type: "image/jpeg" });

const uploadParams = {
    apiUrl: "http://localhost",
    damBasePath: "dam",
    data: { file, scope: {} },
};

const replaceByIdParams = {
    apiUrl: "http://localhost",
    damBasePath: "dam",
    data: { file, fileId: "file-id" },
};

function mockFetchResponse(body: string, { status, contentType }: { status: number; contentType?: string }) {
    const headers = contentType ? { "content-type": contentType } : undefined;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { status, headers })));
}

describe.each([
    ["upload", () => upload(uploadParams)],
    ["replaceByFilenameAndFolder", () => replaceByFilenameAndFolder(uploadParams)],
    ["replaceById", () => replaceById(replaceByIdParams)],
])("%s", (_, uploadFunction) => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the response data on success", async () => {
        mockFetchResponse(JSON.stringify({ id: "file-id" }), { status: 201, contentType: "application/json" });

        await expect(uploadFunction()).resolves.toEqual({ data: { id: "file-id" } });
    });

    it("throws with the parsed JSON body and its message on a JSON error response", async () => {
        const errorBody = { statusCode: 422, message: "Maximal image resolution exceeded", error: "DextinityImageResolutionException" };
        mockFetchResponse(JSON.stringify(errorBody), { status: 422, contentType: "application/json; charset=utf-8" });

        await expect(uploadFunction()).rejects.toMatchObject({
            message: "Maximal image resolution exceeded",
            response: { status: 422, data: errorBody },
        });
    });

    it("throws with the text body on a non-JSON error response", async () => {
        mockFetchResponse("Bad Gateway", { status: 502, contentType: "text/html" });

        await expect(uploadFunction()).rejects.toMatchObject({
            message: "Uploading the file failed with status 502",
            response: { status: 502, data: "Bad Gateway" },
        });
    });

    it("throws with the HTTP status on a malformed JSON error response", async () => {
        mockFetchResponse("", { status: 500, contentType: "application/json" });

        await expect(uploadFunction()).rejects.toMatchObject({
            message: "Uploading the file failed with status 500",
            response: { status: 500, data: "" },
        });
    });
});
