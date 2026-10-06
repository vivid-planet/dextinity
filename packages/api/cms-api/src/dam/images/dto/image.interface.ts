import type { FileInterface } from "../../files/entities/file.entity.js";
import type { ImageCropArea } from "../entities/image-crop-area.entity.js";

export interface ImageInterface {
    file: FileInterface;

    cropArea?: ImageCropArea;
}
