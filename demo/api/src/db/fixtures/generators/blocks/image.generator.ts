import { type DamImageBlock, type ExtractBlockInputFactoryProps, type FileInterface, FocalPoint, type ImageCropAreaInput } from "@dextinity/cms-api";
import { faker } from "@src/db/fixtures/faker";

export const generateImageBlock = (
    imageFiles: FileInterface[] | FileInterface,
    cropArea?: ImageCropAreaInput,
): ExtractBlockInputFactoryProps<typeof DamImageBlock> => {
    const imageFile = Array.isArray(imageFiles) ? faker.helpers.arrayElement(imageFiles) : imageFiles;
    const type = imageFile.mimetype == "image/svg+xml" ? "svgImage" : "pixelImage";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {
        damFileId: imageFile.id,
    };
    if (type == "pixelImage") {
        props.cropArea = cropArea ?? calculateDefaultCropInput(imageFile);
    }
    return {
        attachedBlocks: [
            {
                type,
                props,
            },
        ],
        activeType: type,
    };
};

const calculateDefaultCropInput = ({ image }: FileInterface): ImageCropAreaInput => {
    const focalPoint = faker.helpers.arrayElement([
        FocalPoint.SMART,
        FocalPoint.CENTER,
        FocalPoint.NORTHEAST,
        FocalPoint.NORTHWEST,
        FocalPoint.SOUTHEAST,
        FocalPoint.SOUTHWEST,
    ]);

    return {
        focalPoint,
        x: focalPoint !== FocalPoint.SMART ? 0 : undefined,
        y: focalPoint !== FocalPoint.SMART ? 0 : undefined,
        height: focalPoint !== FocalPoint.SMART ? faker.number.int({ min: 20, max: 100 }) : undefined,
        width: focalPoint !== FocalPoint.SMART ? faker.number.int({ min: 20, max: 100 }) : undefined,
    };
};
