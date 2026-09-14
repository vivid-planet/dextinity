import { Loading } from "@dextinity/admin";
import { css } from "@mui/material";
import { styled } from "@mui/material/styles";
import { forwardRef, useState } from "react";
import useDimensions from "react-cool-dimensions";

import { Device } from "./Device";

interface DeviceConfig {
    outerFrame: {
        width: number;
        height: number;
    };
}

const devicesConfig: Record<Exclude<Device, Device.Responsive>, DeviceConfig> = {
    [Device.Mobile]: {
        outerFrame: {
            width: 406,
            height: 763,
        },
    },
    [Device.Tablet]: {
        outerFrame: {
            width: 1063,
            height: 766,
        },
    },
    [Device.Desktop]: {
        outerFrame: {
            width: 1600,
            height: 885,
        },
    },
};

interface Props {
    device: Device;
    initialPageUrl: string;
}

const IFrameViewer = forwardRef<HTMLIFrameElement, Props>(({ device, initialPageUrl }, iFrameRef) => {
    const deviceConfig = resolveDeviceConfig(device);

    const { observe: containerRef, width, height } = useDimensions<HTMLDivElement | null>();
    const [isLoading, setIsLoading] = useState(true);

    const scaleFactor = deviceConfig ? calcScaleFactor(width, height, deviceConfig) : 1;

    return (
        <Root ref={containerRef}>
            {isLoading && <Loading behavior="fillParentAbsolute" sx={{ zIndex: 1 }} />}
            <OuterFrame
                // Inline style to prevent device frame disappearing while scaling
                style={{ transform: `scale(${scaleFactor})` }}
                deviceConfig={deviceConfig}
            >
                <IFrame ref={iFrameRef} src={initialPageUrl} deviceConfig={deviceConfig} onLoad={() => setIsLoading(false)} />
            </OuterFrame>
        </Root>
    );
});

function resolveDeviceConfig(device: Device): DeviceConfig | null {
    if (device === Device.Responsive) {
        return null;
    }

    return devicesConfig[device];
}

function calcScaleFactor(width: number, height: number, deviceConfig: DeviceConfig) {
    if (width >= deviceConfig.outerFrame.width + 40 && height >= deviceConfig.outerFrame.height + 40) {
        return 1;
    }

    const scaleX = width / (deviceConfig.outerFrame.width + 40);
    const scaleY = height / (deviceConfig.outerFrame.height + 40);

    return Math.min(scaleX, scaleY, 1);
}

const Root = styled("div")`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background-color: ${({ theme }) => theme.palette.grey[100]};
`;

interface IFrameProps {
    deviceConfig: DeviceConfig | null;
}

const OuterFrame = styled("div", { shouldForwardProp: (prop) => prop !== "deviceConfig" })<IFrameProps>`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    will-change: transform;

    ${({ deviceConfig }) =>
        deviceConfig !== null &&
        css`
            position: absolute;
            left: calc(50% - ${deviceConfig.outerFrame.width / 2}px);
            top: calc(50% - ${deviceConfig.outerFrame.height / 2}px);
            width: ${deviceConfig.outerFrame.width}px;
            height: ${deviceConfig.outerFrame.height}px;
        `}
`;

const IFrame = styled("iframe", { shouldForwardProp: (prop) => prop !== "deviceConfig" })<IFrameProps>`
    display: block;
    border-style: unset;
    border-width: 0px;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.palette.common.white};

    ${OuterFrame}:not(:hover):not(:active) & {
        /**
        * Remove iFrame pointer-events while not interacting with the parent to fix a chrome-bug that prevents
        * drag-and-drop from working in a modal over the iFrame when using an external URL as the source.
        * Source: https://medium.com/@marcmintel/most-weird-bug-or-security-feature-with-iframes-and-native-drag-and-drop-13ffbc26107a
        */
        pointer-events: none;
    }
`;

export { IFrameViewer };
