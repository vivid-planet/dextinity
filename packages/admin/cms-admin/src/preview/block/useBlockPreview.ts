import { useStoredState } from "@dextinity/admin";
import type { Dispatch, SetStateAction } from "react";

import { Device } from "../common/Device";

interface BlockPreviewApi {
    device: Device;
    setDevice: Dispatch<SetStateAction<Device>>;
    showOnlyVisible: boolean;
    setShowOnlyVisible: Dispatch<SetStateAction<boolean>>;
    minimized: boolean;
    setMinimized: Dispatch<SetStateAction<boolean>>;
}

function useBlockPreview(): BlockPreviewApi {
    const [device, setDevice] = useStoredState<Device>("previewDevice", Device.Responsive);
    const [showOnlyVisible, setShowOnlyVisible] = useStoredState<boolean>("previewShowOnlyVisible", true);
    const [minimized, setMinimized] = useStoredState<boolean>("previewMinimized", false);

    return { device, setDevice, showOnlyVisible, setShowOnlyVisible, minimized, setMinimized };
}

export { type BlockPreviewApi, useBlockPreview };
