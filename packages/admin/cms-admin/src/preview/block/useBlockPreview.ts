import { useStoredState } from "@dextinity/admin";
import type { DevicePreviewDevice } from "@dextinity/ui";
import { type Dispatch, type SetStateAction, useCallback } from "react";

import { parsePreviewDevice } from "../common/previewDevice";

interface BlockPreviewApi {
    device: DevicePreviewDevice;
    setDevice: Dispatch<SetStateAction<DevicePreviewDevice>>;
    showOnlyVisible: boolean;
    setShowOnlyVisible: Dispatch<SetStateAction<boolean>>;
    minimized: boolean;
    setMinimized: Dispatch<SetStateAction<boolean>>;
}

function useBlockPreview(): BlockPreviewApi {
    const [storedDevice, setStoredDevice] = useStoredState<DevicePreviewDevice | number>("previewDevice", "responsive");
    const [showOnlyVisible, setShowOnlyVisible] = useStoredState<boolean>("previewShowOnlyVisible", true);
    const [minimized, setMinimized] = useStoredState<boolean>("previewMinimized", false);

    const setDevice = useCallback<Dispatch<SetStateAction<DevicePreviewDevice>>>(
        (action) => {
            setStoredDevice((previous) => (typeof action === "function" ? action(parsePreviewDevice(previous)) : action));
        },
        [setStoredDevice],
    );

    return { device: parsePreviewDevice(storedDevice), setDevice, showOnlyVisible, setShowOnlyVisible, minimized, setMinimized };
}

export { type BlockPreviewApi, useBlockPreview };
