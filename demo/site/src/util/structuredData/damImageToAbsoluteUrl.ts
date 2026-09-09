import { generateImageUrl } from "@dextinity/site-nextjs";
import type { DamImageBlockData } from "@src/blocks.generated";

function damImageToUrl(image: DamImageBlockData): string | undefined {
    const props = image.block?.props;

    if (!props) {
        return undefined;
    }

    if ("urlTemplate" in props && props.damFile?.image) {
        const { width, height } = props.damFile.image;
        return generateImageUrl({ src: props.urlTemplate, width }, width / height);
    }

    return props.damFile?.fileUrl;
}

export function damImageToAbsoluteUrl(image: DamImageBlockData, siteUrl: string): string | undefined {
    const url = damImageToUrl(image);

    return url ? new URL(url, siteUrl).toString() : undefined;
}
