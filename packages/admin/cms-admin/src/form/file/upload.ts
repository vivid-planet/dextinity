import type { GQLUpdateDamFileInput } from "../../graphql.generated";

interface UploadFileData {
    file: File &
        Pick<GQLUpdateDamFileInput, "license" | "title" | "altText"> & { importSource?: { importSourceType: string; importSourceId: string } };
    scope: Record<string, unknown>;
    folderId?: string;
    /**
     * @deprecated Set `file.importSource.importSourceId` instead
     */
    importSourceId?: string;
    /**
     * @deprecated Set `file.importSource.importSourceType` instead
     */
    importSourceType?: string;
}
interface UploadFileParams {
    apiUrl: string;
    data: UploadFileData;
    options?: { onUploadProgress?: (event: ProgressEvent) => void };
    damBasePath: string;
}

export function upload<ResponseData>(uploadFileParams: UploadFileParams) {
    const controller = new AbortController();
    const promise = uploadOrReplaceByFilenameAndFolder<ResponseData>(uploadFileParams, controller.signal);
    return promise;
}

export function replaceByFilenameAndFolder<ResponseData>(uploadFileParams: UploadFileParams) {
    const controller = new AbortController();
    const promise = uploadOrReplaceByFilenameAndFolder<ResponseData>({ ...uploadFileParams, replace: true }, controller.signal);
    return promise;
}

async function uploadOrReplaceByFilenameAndFolder<ResponseData>(
    { apiUrl, data, replace = false, damBasePath }: UploadFileParams & { replace?: boolean },
    signal?: AbortSignal,
): Promise<{ data: ResponseData }> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("scope", JSON.stringify(data.scope));

    if (data.importSourceId && data.importSourceType && !data.file.importSource) {
        formData.append("importSourceId", data.importSourceId);
        formData.append("importSourceType", data.importSourceType);
    }
    if (data.file.importSource) {
        formData.append("importSourceId", data.file.importSource.importSourceId);
        formData.append("importSourceType", data.file.importSource.importSourceType);
    }
    if (data.file.license) {
        formData.append("license", JSON.stringify(data.file.license));
    }
    if (data.file.title) {
        formData.append("title", data.file.title);
    }
    if (data.file.altText) {
        formData.append("altText", data.file.altText);
    }
    if (data.folderId !== undefined) {
        formData.append("folderId", data.folderId);
    }

    const endpoint = replace ? `/${damBasePath}/files/replace-by-filename-and-folder` : `/${damBasePath}/files/upload`;
    const url = apiUrl + endpoint;
    const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal,
    });

    if (!response.ok) {
        throw new UploadFileError({ status: response.status, data: await parseResponseBody(response) });
    }

    const dataJson = await response.json();
    return { data: dataJson };
}

class UploadFileError extends Error {
    readonly response: { status: number; data: unknown };

    constructor(response: { status: number; data: unknown }) {
        super(getErrorMessage(response.data) ?? `Uploading the file failed with status ${response.status}`);
        this.response = response;
    }
}

function getErrorMessage(data: unknown): string | undefined {
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
    }
    return undefined;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
    if (!isJson) {
        return text;
    }
    // A proxy or failing server can send an empty or malformed body with a JSON content type
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

interface ReplaceFileByIdData {
    file: File & Pick<GQLUpdateDamFileInput, "license" | "title" | "altText">;
    fileId: string;
}

export function replaceById({ apiUrl, data, damBasePath }: Omit<UploadFileParams, "data"> & { data: ReplaceFileByIdData }) {
    const controller = new AbortController();
    const promise = (async () => {
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("fileId", data.fileId);
        if (data.file.license) {
            formData.append("license", JSON.stringify(data.file.license));
        }
        if (data.file.title) {
            formData.append("title", data.file.title);
        }
        if (data.file.altText) {
            formData.append("altText", data.file.altText);
        }

        const url = `${apiUrl}/${damBasePath}/files/replace-by-id`;
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new UploadFileError({ status: response.status, data: await parseResponseBody(response) });
        }

        const dataJson = await response.json();
        return { data: dataJson };
    })();
    return promise;
}
