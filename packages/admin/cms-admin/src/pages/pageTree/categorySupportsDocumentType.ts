import type { DocumentInterface, DocumentType } from "../../documents/types";

export function categorySupportsDocumentType(
    category: string,
    documentType: string,
    getDocumentTypesByCategory?: (category: string) => Record<DocumentType, DocumentInterface>,
) {
    if (getDocumentTypesByCategory === undefined) {
        // fallback if no category->documentTypes mapping function was passed
        return true;
    }

    const supportedDocumentTypes = Object.keys(getDocumentTypesByCategory(category));
    return supportedDocumentTypes.includes(documentType);
}
