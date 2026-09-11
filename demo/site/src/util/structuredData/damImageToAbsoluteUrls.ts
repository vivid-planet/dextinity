import { generateImageUrl } from "@dextinity/site-nextjs";
import type { DamImageBlockData } from "@src/blocks.generated";

// Google recommends providing the article image in these aspect ratios.
// https://developers.google.com/search/docs/appearance/structured-data/article
const aspectRatios = [16 / 9, 4 / 3, 1];
const maxWidth = 1200;

function damImageToUrls(image: DamImageBlockData): string[] {
    const props = image.block?.props;

    if (!props) {
        return [];
    }

    if ("urlTemplate" in props && props.damFile?.image) {
        const width = Math.min(props.damFile.image.width, maxWidth);
        return aspectRatios.map((aspectRatio) => generateImageUrl({ src: props.urlTemplate, width }, aspectRatio));
    }

    return props.damFile?.fileUrl ? [props.damFile.fileUrl] : [];
}

export function damImageToAbsoluteUrls(image: DamImageBlockData, siteUrl: string): string[] {
    return damImageToUrls(image).map((url) => new URL(url, siteUrl).toString());
}
