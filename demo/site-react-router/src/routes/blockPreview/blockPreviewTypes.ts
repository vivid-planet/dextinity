/**
 * The previews of BlockPreview.tsx, a client component module, so the loader of the route can't read them
 */
export const blockPreviewTypes = ["page", "stage", "main-menu", "footer", "welcome-email", "brevo-email-campaign"] as const;

export type BlockPreviewType = (typeof blockPreviewTypes)[number];

export function isBlockPreviewType(type: string): type is BlockPreviewType {
    return (blockPreviewTypes as readonly string[]).includes(type);
}
