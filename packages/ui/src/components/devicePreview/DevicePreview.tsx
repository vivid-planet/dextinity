import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { SegmentedControl } from "../segmentedControl/SegmentedControl";
import styles from "./DevicePreview.module.scss";

export type DevicePreviewDevice = "desktop" | "tablet" | "mobile";

export interface DevicePreviewLabels {
    /** The accessible name of the device switch. */
    device: string;
    /** The accessible name of the desktop option. */
    desktop: string;
    /** The accessible name of the tablet option. */
    tablet: string;
    /** The accessible name of the phone option. */
    mobile: string;
}

const defaultLabels: DevicePreviewLabels = {
    device: "Device",
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Phone",
};

const defaultDeviceWidths: Record<DevicePreviewDevice, number> = {
    desktop: 1280,
    tablet: 768,
    mobile: 375,
};

const deviceIcons = { desktop: "desktop", tablet: "tablet", mobile: "phone" } as const;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DevicePreviewOwnerState = {
    device: DevicePreviewDevice;
};

export interface DevicePreviewSlotProps {
    /** Props for the `toolbar` slot, the bar with the device switch and the address. */
    toolbar?: SlotPropsValue<DevicePreviewOwnerState, "div">;
    /** Props for the `url` slot, the address. */
    url?: SlotPropsValue<DevicePreviewOwnerState, "span">;
    /** Props for the `viewport` slot, the area the frame is centered in. */
    viewport?: SlotPropsValue<DevicePreviewOwnerState, "div">;
    /** Props for the `frame` slot, the device-sized window around the content. */
    frame?: SlotPropsValue<DevicePreviewOwnerState, "div">;
}

export interface DevicePreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
    /** The address of the previewed page, shown above it. */
    url: string;
    /** The device whose width the page is shown at. */
    device: DevicePreviewDevice;
    /** Called with the device chosen in the switch. */
    onDeviceChange: (device: DevicePreviewDevice) => void;
    /** The previewed page, e.g. an `iframe` filling its parent, or the rendered blocks. It is laid out at the device's width. */
    children?: ReactNode;
    /**
     * The width in CSS pixels each device lays the page out at. Narrower space scales the page down instead of reflowing it.
     *
     * @defaultValue `{ desktop: 1280, tablet: 768, mobile: 375 }`
     */
    deviceWidths?: Partial<Record<DevicePreviewDevice, number>>;
    /** Further actions at the end of the toolbar, e.g. opening the page in a new tab. */
    actions?: ReactNode;
    /** The built-in texts. */
    labels?: Partial<DevicePreviewLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: DevicePreviewSlotProps;
}

/**
 * The preview of a website page with a device switch: lays the page out at the device's width and scales it down to fit.
 */
export const DevicePreview = forwardRef<HTMLDivElement, DevicePreviewProps>(function DevicePreview(
    { url, device, onDeviceChange, children, deviceWidths: deviceWidthsProp, actions, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const deviceWidths = { ...defaultDeviceWidths, ...deviceWidthsProp };
    const ownerState: DevicePreviewOwnerState = { device };
    const stageRef = useRef<HTMLDivElement>(null);
    const [available, setAvailable] = useState<{ width: number; height: number }>();

    useEffect(() => {
        const stage = stageRef.current;
        if (stage == null || typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    const deviceWidth = deviceWidths[ownerState.device];
    const scale = available != null && available.width > 0 ? Math.min(1, available.width / deviceWidth) : 1;
    const frameStyle: CSSProperties = {
        inlineSize: available != null ? Math.min(deviceWidth * scale, available.width) : undefined,
    };
    const contentStyle = {
        inlineSize: deviceWidth,
        blockSize: available != null ? available.height / scale : undefined,
        transform: scale < 1 ? `scale(${scale})` : undefined,
        "--dextinity-device-preview-scale": scale,
    } as CSSProperties;

    const toolbarProps = resolveSlotProps<DevicePreviewOwnerState, "div", "div">({
        ownProps: { className: styles.toolbar },
        slotProps: slotProps?.toolbar,
        ownerState,
    });
    const urlProps = resolveSlotProps<DevicePreviewOwnerState, "span", "span">({
        ownProps: { className: styles.url, title: url },
        slotProps: slotProps?.url,
        ownerState,
    });
    const viewportProps = resolveSlotProps<DevicePreviewOwnerState, "div", "div">({
        ownProps: { className: styles.viewport },
        slotProps: slotProps?.viewport,
        ownerState,
    });
    const frameProps = resolveSlotProps<DevicePreviewOwnerState, "div", "div">({
        ownProps: { className: styles.frame, style: frameStyle },
        slotProps: slotProps?.frame,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-device={ownerState.device} className={clsx(styles.root, className)}>
            <div {...toolbarProps}>
                <SegmentedControl<DevicePreviewDevice>
                    size="small"
                    aria-label={labels.device}
                    value={ownerState.device}
                    onChange={onDeviceChange}
                    options={(["desktop", "tablet", "mobile"] as const).map((option) => ({
                        value: option,
                        icon: <Icon name={deviceIcons[option]} />,
                        "aria-label": labels[option],
                    }))}
                />
                <span {...urlProps}>{url}</span>
                {actions != null && <span className={styles.actions}>{actions}</span>}
            </div>
            <div {...viewportProps}>
                <div ref={stageRef} className={styles.stage}>
                    <div {...frameProps}>
                        <div className={styles.content} style={contentStyle}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
