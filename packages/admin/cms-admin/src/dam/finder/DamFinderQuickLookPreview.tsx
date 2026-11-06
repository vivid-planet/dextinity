import { AssetThumbnail, Spinner } from "@dextinity/ui";
import { type CSSProperties, useState } from "react";
import { useIntl } from "react-intl";

import { useDextinityConfig } from "../../config/DextinityConfigContext";
import { useDamBasePath } from "../config/damConfig";
import { getDamFinderAssetType, getDamFinderQuickLookImageUrl, getFileExtension } from "./damFinderItems";
import type { GQLDamFinderFileFragment } from "./damFinderItems.fragment.generated";
import { PlaceholderFrame, PreviewFrame, PreviewImage, PreviewVideo } from "./DamFinderQuickLookPreview.sc";

interface Dimensions {
    width: number;
    height: number;
}

interface DamFinderQuickLookPreviewProps {
    file: GQLDamFinderFileFragment;
}

/**
 * The large preview of a file in the finder's quick look: images scaled down by the image URL service instead of the original, videos
 * playable, and a placeholder for everything else. The preview keeps its size while it loads, with a spinner.
 */
export function DamFinderQuickLookPreview({ file }: DamFinderQuickLookPreviewProps) {
    const intl = useIntl();
    const { apiUrl } = useDextinityConfig();
    const damBasePath = useDamBasePath();
    const type = getDamFinderAssetType(file.mimetype);
    const [loadedDimensions, setLoadedDimensions] = useState<Dimensions>();
    const [hasResizedImageFailed, setHasResizedImageFailed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    if (type === "document") {
        return (
            <PlaceholderFrame>
                <AssetThumbnail type="document" fileType={getFileExtension(file.name)} />
            </PlaceholderFrame>
        );
    }

    const dimensions = file.image ?? loadedDimensions;
    const style: CSSProperties | undefined =
        dimensions != null
            ? {
                  ["--dam-finder-preview-width" as string]: `${dimensions.width}px`,
                  ["--dam-finder-preview-aspect-ratio" as string]: `${dimensions.width} / ${dimensions.height}`,
              }
            : undefined;
    const loadingLabel = intl.formatMessage({ id: "dextinity.damFinder.quickLook.loading", defaultMessage: "Loading preview" });

    if (type === "video") {
        return (
            <PreviewFrame style={style}>
                <PreviewVideo
                    src={file.fileUrl}
                    controls
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                        const video = event.currentTarget;
                        setLoadedDimensions({ width: video.videoWidth, height: video.videoHeight });
                        setIsLoaded(true);
                    }}
                />
                {!isLoaded && <Spinner size="lg" aria-label={loadingLabel} />}
            </PreviewFrame>
        );
    }

    const quickLookImageUrl = getDamFinderQuickLookImageUrl({ file, apiUrl, damBasePath });
    const isResized = quickLookImageUrl !== file.fileUrl && !hasResizedImageFailed;
    const src = isResized ? quickLookImageUrl : file.fileUrl;

    return (
        <PreviewFrame style={style}>
            <PreviewImage
                key={src}
                src={src}
                alt={file.altText ?? file.name}
                onLoad={(event) => {
                    const image = event.currentTarget;
                    setLoadedDimensions({ width: image.naturalWidth, height: image.naturalHeight });
                    setIsLoaded(true);
                }}
                onError={() => {
                    if (isResized) {
                        setHasResizedImageFailed(true);
                    } else {
                        setIsLoaded(true);
                    }
                }}
            />
            {!isLoaded && <Spinner size="lg" aria-label={loadingLabel} />}
        </PreviewFrame>
    );
}
