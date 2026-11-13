import type { DevicePreviewLabels } from "@dextinity/ui";
import { useIntl } from "react-intl";

export function usePreviewLabels(): DevicePreviewLabels {
    const intl = useIntl();
    return {
        device: intl.formatMessage({ id: "dextinity.preview.device", defaultMessage: "Device" }),
        responsive: intl.formatMessage({ id: "dextinity.preview.device.responsive", defaultMessage: "Full width" }),
        desktop: intl.formatMessage({ id: "dextinity.preview.device.desktop", defaultMessage: "Desktop" }),
        tablet: intl.formatMessage({ id: "dextinity.preview.device.tablet", defaultMessage: "Tablet" }),
        mobile: intl.formatMessage({ id: "dextinity.preview.device.mobile", defaultMessage: "Phone" }),
        frame: intl.formatMessage({ id: "dextinity.preview.frame", defaultMessage: "Page preview" }),
        loading: intl.formatMessage({ id: "dextinity.preview.loading", defaultMessage: "Loading preview" }),
    };
}
