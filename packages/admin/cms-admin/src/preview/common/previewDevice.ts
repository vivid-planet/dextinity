import type { DevicePreviewDevice } from "@dextinity/ui";

export const previewDevices: DevicePreviewDevice[] = ["responsive", "desktop", "tablet", "mobile"];

const legacyPreviewDevices: Record<string, DevicePreviewDevice> = {
    "0": "responsive",
    "1": "mobile",
    "2": "tablet",
    "3": "desktop",
};

/**
 * Reads a device from storage or the URL. Earlier versions stored the index of the removed `Device` enum, which is still understood.
 */
export function parsePreviewDevice(value: unknown): DevicePreviewDevice {
    if (typeof value === "string" && (previewDevices as string[]).includes(value)) {
        return value as DevicePreviewDevice;
    }
    if (typeof value === "string" || typeof value === "number") {
        return legacyPreviewDevices[String(value)] ?? "responsive";
    }
    return "responsive";
}
