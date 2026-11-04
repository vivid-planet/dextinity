// Fallback to 1 / 1 aspect ratio for invalid value format
export function parseAspectRatio(value: string | number): number {
    let width, height;
    if (typeof value === "string") {
        [width, height] = value.split(/[x/:]/).map((v) => {
            let ret: number | undefined = parseFloat(v);
            if (isNaN(ret)) {
                ret = undefined;
            }
            return ret;
        });
        if (width && !height) {
            height = 1;
        }
    } else {
        width = value;
        height = 1;
    }
    if (!width || !height) {
        throw Error(`An error occurred while parsing the aspect ratio: ${value}`);
    }

    return width / height;
}

// duplicated from api/src/images/images.util.ts
export interface ImageDimensions {
    width: number;
    height: number;
}

// duplicated from api/src/images/images.util.ts
export function getMaxDimensionsFromArea(area: ImageDimensions, aspectRatio: number): ImageDimensions {
    let width: number, height: number;
    if (aspectRatio < 1) {
        width = Math.min(area.height * aspectRatio, area.width);
        height = width / aspectRatio;
    } else {
        height = Math.min(area.width / aspectRatio, area.height);
        width = height * aspectRatio;
    }

    return {
        width,
        height,
    };
}

// Duplicate of api/cms-api/src/dam/images/images.util.ts
export function calculateInheritAspectRatio(
    imageDimensions: ImageDimensions,
    cropArea: {
        focalPoint: "SMART" | "CENTER" | "NORTHWEST" | "NORTHEAST" | "SOUTHWEST" | "SOUTHEAST";
        width?: number;
        height?: number;
        x?: number;
        y?: number;
    },
): number {
    if (cropArea.focalPoint === "SMART") {
        return imageDimensions.width / imageDimensions.height;
    } else {
        if (cropArea.width === undefined || cropArea.height === undefined) {
            throw new Error("Missing crop dimensions");
        }

        return (cropArea.width * imageDimensions.width) / 100 / ((cropArea.height * imageDimensions.height) / 100);
    }
}

export function generateImageUrl({ src, width }: { src: string; width: number }, aspectRatio: number): string {
    return src.replace("$resizeWidth", String(width)).replace("$resizeHeight", String(Math.ceil(width / aspectRatio)));
}
