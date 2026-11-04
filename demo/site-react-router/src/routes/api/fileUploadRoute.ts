import type { Route } from "./+types/fileUploadRoute";

export async function action(args: Route.ActionArgs) {
    // Loaded on use, so that missing environment variables of this route don't break the whole site
    const { handleFileUploadRequest } = await import("./fileUpload");
    return handleFileUploadRequest(args);
}
