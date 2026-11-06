import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode, type SyntheticEvent, useEffect, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { SegmentedControl } from "../segmentedControl/SegmentedControl";
import { Spinner } from "../spinner/Spinner";
import styles from "./DevicePreview.module.scss";

/** A device the page can be previewed at; `responsive` fills the available width. */
export type DevicePreviewDevice = "responsive" | "desktop" | "tablet" | "mobile";

export interface DevicePreviewLabels {
    /** The accessible name of the device switch. */
    device: string;
    /** The accessible name of the full-width option. */
    responsive: string;
    /** The accessible name of the desktop option. */
    desktop: string;
    /** The accessible name of the tablet option. */
    tablet: string;
    /** The accessible name of the phone option. */
    mobile: string;
    /** The accessible name of the `iframe` that shows the page from `src`. */
    frame: string;
    /** The accessible name of the spinner while the page loads. */
    loading: string;
}

const defaultLabels: DevicePreviewLabels = {
    device: "Device",
    responsive: "Full width",
    desktop: "Desktop",
    tablet: "Tablet",
    mobile: "Phone",
    frame: "Page preview",
    loading: "Loading preview",
};

const defaultDevices: DevicePreviewDevice[] = ["desktop", "tablet", "mobile"];

const defaultDeviceWidths: Record<DevicePreviewDevice, number | "fill"> = {
    responsive: "fill",
    desktop: 1280,
    tablet: 768,
    mobile: 375,
};

const deviceIcons = { responsive: "fit-width", desktop: "desktop", tablet: "tablet", mobile: "phone" } as const;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type DevicePreviewOwnerState = {
    device: DevicePreviewDevice;
    /** The page fills the available width instead of being laid out at a fixed width. */
    fill: boolean;
    /** The page is shown in the built-in `iframe`, from `src`. */
    iframe: boolean;
    loading: boolean;
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
    /** Props for the `iframe` slot, which shows the page from `src`, e.g. a `ref` to talk to the page with `postMessage`. */
    iframe?: SlotPropsValue<DevicePreviewOwnerState, "iframe">;
    /** Props for the `overlay` slot, the layer above the page that holds `overlay`. */
    overlay?: SlotPropsValue<DevicePreviewOwnerState, "div">;
    /** Props for the `loadingOverlay` slot, which covers the frame while the page loads. */
    loadingOverlay?: SlotPropsValue<DevicePreviewOwnerState, "div">;
}

export interface DevicePreviewProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
    /** The address of the previewed page, shown above it. */
    url: string;
    /** The device whose width the page is shown at. */
    device: DevicePreviewDevice;
    /** Called with the device chosen in the switch. */
    onDeviceChange: (device: DevicePreviewDevice) => void;
    /**
     * The devices offered in the switch, in this order.
     *
     * @defaultValue `["desktop", "tablet", "mobile"]`
     */
    devices?: DevicePreviewDevice[];
    /** The previewed page, e.g. the rendered blocks. It is laid out at the device's width. Leave it out when using `src`. */
    children?: ReactNode;
    /**
     * The address of the page to show in a built-in `iframe` that fills the frame and scrolls itself. The frame shows a spinner until
     * the page has loaded.
     */
    src?: string;
    /**
     * Shows the spinner over the frame, e.g. until the page in the `iframe` is ready to receive content. Without it, the spinner shows
     * while the page from `src` loads.
     */
    loading?: boolean;
    /** Replaces the spinner shown while loading. */
    loadingIndicator?: ReactNode;
    /**
     * A layer above the page, e.g. outlines of the hovered and the selected block. It has the page's size and scale, so positions
     * reported by the page apply unchanged, and lets clicks through to the page.
     */
    overlay?: ReactNode;
    /**
     * The width in CSS pixels each device lays the page out at, or `fill` to use the available width. Narrower space scales the page
     * down instead of reflowing it.
     *
     * @defaultValue `{ responsive: "fill", desktop: 1280, tablet: 768, mobile: 375 }`
     */
    deviceWidths?: Partial<Record<DevicePreviewDevice, number | "fill">>;
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
    {
        url,
        device,
        onDeviceChange,
        devices = defaultDevices,
        children,
        src,
        loading: loadingProp,
        loadingIndicator,
        overlay,
        deviceWidths: deviceWidthsProp,
        actions,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const deviceWidths = { ...defaultDeviceWidths, ...deviceWidthsProp };
    const stageRef = useRef<HTMLDivElement>(null);
    const [available, setAvailable] = useState<{ width: number; height: number }>();
    const [loadedSrc, setLoadedSrc] = useState<string>();
    const configuredWidth = deviceWidths[device];
    const ownerState: DevicePreviewOwnerState = {
        device,
        fill: configuredWidth === "fill",
        iframe: src != null,
        loading: loadingProp ?? (src != null && loadedSrc !== src),
    };

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

    const deviceWidth = configuredWidth === "fill" ? available?.width : configuredWidth;
    const scale = available != null && available.width > 0 && deviceWidth != null ? Math.min(1, available.width / deviceWidth) : 1;
    const frameStyle: CSSProperties = {
        inlineSize: available != null && deviceWidth != null ? Math.min(deviceWidth * scale, available.width) : undefined,
    };
    const contentStyle = {
        inlineSize: deviceWidth ?? "100%",
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
        ownProps: { className: styles.frame, style: frameStyle, "aria-busy": ownerState.loading || undefined },
        slotProps: slotProps?.frame,
        ownerState,
    });
    const iframeProps = resolveSlotProps<DevicePreviewOwnerState, "iframe", "iframe">({
        ownProps: {
            className: styles.iframe,
            src,
            title: labels.frame,
            onLoad: (event: SyntheticEvent<HTMLIFrameElement>) => setLoadedSrc(event.currentTarget.getAttribute("src") ?? undefined),
        },
        slotProps: slotProps?.iframe,
        ownerState,
    });
    const overlayProps = resolveSlotProps<DevicePreviewOwnerState, "div", "div">({
        ownProps: { className: styles.overlay },
        slotProps: slotProps?.overlay,
        ownerState,
    });
    const loadingOverlayProps = resolveSlotProps<DevicePreviewOwnerState, "div", "div">({
        ownProps: { className: styles.loadingOverlay },
        slotProps: slotProps?.loadingOverlay,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-device={ownerState.device}
            data-fill={ownerState.fill ? "" : undefined}
            data-iframe={ownerState.iframe ? "" : undefined}
            data-loading={ownerState.loading ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...toolbarProps}>
                <SegmentedControl<DevicePreviewDevice>
                    size="small"
                    aria-label={labels.device}
                    value={ownerState.device}
                    onChange={onDeviceChange}
                    options={devices.map((option) => ({
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
                            {ownerState.iframe ? <iframe {...iframeProps} /> : children}
                            {overlay != null && <div {...overlayProps}>{overlay}</div>}
                        </div>
                        {ownerState.loading && (
                            <div {...loadingOverlayProps}>{loadingIndicator ?? <Spinner size="lg" aria-label={labels.loading} />}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
