import { http, HttpResponse } from "msw";

export const fileUploadsHandler = http.post("/file-uploads/upload", async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get("file");

    return HttpResponse.json({
        id: "mock-file-id-123",
        name: file instanceof File ? file.name : "unknown",
        url: `/uploads/mock-file-id-123.jpg`,
    });
});
