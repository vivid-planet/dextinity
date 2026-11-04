import type { FileInterface } from "../../files/entities/file.entity";
import type { ImageCropArea } from "../entities/image-crop-area.entity";

export interface ImageInterface {
    file: FileInterface;

    cropArea?: ImageCropArea;
}
