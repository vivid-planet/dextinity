import mimedb from "mime-db";
import type { Accept } from "react-dropzone";

export function convertMimetypesToDropzoneAccept(acceptedMimetypes: string[]): Accept {
    const acceptObj: Accept = {};

    acceptedMimetypes.forEach((mimetype) => {
        let extensions: readonly string[] | undefined;
        if (mimetype === "application/x-zip-compressed") {
            // zip files in Windows, not supported by mime-db
            // see https://github.com/jshttp/mime-db/issues/245
            extensions = ["zip"];
        } else {
            extensions = mimedb[mimetype]?.extensions;
        }

        if (extensions) {
            acceptObj[mimetype] = extensions.map((extension) => `.${extension}`);
        }
    });

    return acceptObj;
}
