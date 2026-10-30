// The last path segment of the block previews the admin opens
const blockPreviewTypes = ["page", "stage", "main-menu", "footer", "welcome-email", "brevo-email-campaign"] as const;

export type BlockPreviewType = (typeof blockPreviewTypes)[number];

export function isBlockPreviewType(type: string): type is BlockPreviewType {
    return (blockPreviewTypes as readonly string[]).includes(type);
}
