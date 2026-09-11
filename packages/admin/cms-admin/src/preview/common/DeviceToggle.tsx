import { DeviceDesktop, DevicePhone, DeviceResponsive, DeviceTablet } from "@dextinity/admin-icons";
import { ToggleButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { MouseEvent } from "react";

import { Device } from "./Device";
import { ToggleButton } from "./ToggleButton";

interface Props {
    device: Device;
    onChange: (device: Device) => void;
}

function DeviceToggle({ device, onChange }: Props) {
    const handleDeviceChange = (event: MouseEvent<HTMLElement>, newDevice: Device | null) => {
        if (newDevice === null) {
            // Disable deselection
            return;
        }

        onChange(newDevice);
    };

    return (
        <Root value={device} onChange={handleDeviceChange} exclusive>
            <ToggleButton value={Device.Responsive}>
                <DeviceResponsive />
            </ToggleButton>
            <ToggleButton value={Device.Mobile}>
                <DevicePhone />
            </ToggleButton>
            <ToggleButton value={Device.Tablet}>
                <DeviceTablet />
            </ToggleButton>
            <ToggleButton value={Device.Desktop}>
                <DeviceDesktop />
            </ToggleButton>
        </Root>
    );
}

const Root = styled(ToggleButtonGroup)`
    border-radius: 0;
    border-right: 1px solid #2e3440;
    border-left: 1px solid #2e3440;
    background-color: transparent;
`;

export { DeviceToggle };
