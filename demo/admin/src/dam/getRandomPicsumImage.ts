import type { FileWithDamUploadMetadata } from "@dextinity/cms-admin";

export interface PicsumImage {
    file: FileWithDamUploadMetadata;
    url: string;
}

async function fetchPicsumImage(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch image");
    }

    return {
        blob: await response.blob(),
        origin: response.url,
    };
}

function extractFileNameFromUrl(url: string): string {
    const fileNameWithQuery = url.split("?")[0];
    const fileNameStart = fileNameWithQuery.split("/").indexOf("id");
    const fileName = `${fileNameWithQuery.split("/")[fileNameStart]}-${fileNameWithQuery.split("/")[fileNameStart + 1]}`;
    return fileName ? `${fileName}.jpeg` : "unnamed.jpeg";
}

export async function getRandomPicsumImage(): Promise<PicsumImage> {
    const imageUrl = "https://picsum.photos/1920/1080";

    try {
        const image = await fetchPicsumImage(imageUrl);
        const mimeType = image.blob.type;

        if (mimeType !== "image/jpeg") {
            return getRandomPicsumImage();
        }

        const fileName = extractFileNameFromUrl(image.origin);
        const acceptedFile: FileWithDamUploadMetadata = new File([image.blob], fileName, { type: mimeType });
        acceptedFile.importSource = {
            importSourceId: image.origin,
            importSourceType: "picsum",
        };

        return {
            file: acceptedFile,
            url: image.origin,
        };
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error}`);
    }
}
