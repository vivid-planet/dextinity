import { useDamConfig } from "./damConfig";
import { damDefaultAcceptedMimeTypes } from "./damDefaultAcceptedMimeTypes";
import { type DamFileCategory, getDamFileCategory } from "./damFileCategory";

interface UseDamAcceptedMimeTypesApi {
    allAcceptedMimeTypes: string[];
    filteredAcceptedMimeTypes: Record<DamFileCategory, string[]> & {
        pdf: string[];
        captions: string[];
    };
}

const filterByCategory = (mimeTypes: string[], category: DamFileCategory) =>
    mimeTypes.filter((mimeType) => getDamFileCategory(mimeType) === category);

export const useDamAcceptedMimeTypes = (): UseDamAcceptedMimeTypesApi => {
    const damConfig = useDamConfig();
    const allAcceptedMimeTypes = damConfig.acceptedMimeTypes ?? damDefaultAcceptedMimeTypes;

    return {
        allAcceptedMimeTypes,
        filteredAcceptedMimeTypes: {
            svgImage: filterByCategory(allAcceptedMimeTypes, "svgImage"),
            pixelImage: filterByCategory(allAcceptedMimeTypes, "pixelImage"),
            audio: filterByCategory(allAcceptedMimeTypes, "audio"),
            video: filterByCategory(allAcceptedMimeTypes, "video"),
            document: filterByCategory(allAcceptedMimeTypes, "document"),
            pdf: allAcceptedMimeTypes.filter((mimeType) => mimeType === "application/pdf"),
            captions: allAcceptedMimeTypes.filter((mimeType) => mimeType === "text/vtt"),
        },
    };
};
