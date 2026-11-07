import { Banner } from "@dextinity/ui";
import { FormattedMessage } from "react-intl";

/** Warns that a video is larger than `videoPerformanceWarningFileSize` of the DAM config and will load slowly on the site. */
export function VideoPerformanceWarningAlert() {
    return (
        <Banner tone="warning">
            <strong>
                <FormattedMessage id="dextinity.dam.videoPerformanceWarning.title" defaultMessage="Large video file" />
            </strong>{" "}
            <FormattedMessage
                id="dextinity.dam.videoPerformanceWarning.text"
                defaultMessage="This video is very large. Videos are delivered without optimization, which can lead to poor loading performance."
            />
        </Banner>
    );
}
