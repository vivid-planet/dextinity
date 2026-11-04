/**
 * Downloads a file from a blob or URL using native browser APIs
 * @param source - Either a Blob or a URL string
 * @param filename - The filename to save as
 */
export function downloadFile(source: Blob | string, filename: string): void {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Remove link asynchronously to ensure download is initiated
    setTimeout(() => {
        document.body.removeChild(link);
        // Clean up object URL if we created one
        if (typeof source !== "string") {
            URL.revokeObjectURL(url);
        }
    }, 100);
}
