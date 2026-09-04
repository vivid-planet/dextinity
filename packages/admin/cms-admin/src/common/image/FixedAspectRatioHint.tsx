import { FormattedMessage } from "react-intl";

import { formatAspectRatio } from "./aspectRatio";

/**
 * Helper text for the file field of an image block whose crop area is locked to a fixed aspect ratio.
 */
export function FixedAspectRatioHint({ aspectRatio }: { aspectRatio: string | number }) {
    return (
        <FormattedMessage
            id="dextinity.blocks.image.fixedAspectRatioHint"
            defaultMessage="The image is displayed in a {aspectRatio} aspect ratio. Cropping is locked to it."
            values={{ aspectRatio: formatAspectRatio(aspectRatio) }}
        />
    );
}
