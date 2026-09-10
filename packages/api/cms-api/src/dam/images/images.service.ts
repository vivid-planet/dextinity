/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Inject, Injectable } from "@nestjs/common";
import { createHmac } from "crypto";
import { parse } from "path";

import { FocalPoint } from "../../file-utils/focal-point.enum";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG } from "../dam.constants";
import { ImageInterface } from "./dto/image.interface";
import { ImageParams } from "./dto/image.params";

@Injectable()
export class ImagesService {
    constructor(@Inject(DAM_CONFIG) private readonly config: DamConfig) {}

    createHash(params: Omit<ImageParams, "resizeWidth" | "resizeHeight" | "cropArea">): string {
        const fileHash = `file:${params.fileId}:${params.filename}`;
        const cropHash = ["crop", params.cropWidth, params.cropHeight, params.focalPoint, params.cropX, params.cropY]
            .filter((v) => v !== null && v !== undefined)
            .join(":");

        return createHmac("sha1", this.config.secret).update([fileHash, cropHash].join(":")).digest("hex");
    }

    createUrlTemplate({ file, cropArea }: ImageInterface, { previewDamUrls = false }: { previewDamUrls?: boolean }): string {
        const imageCropArea = cropArea !== undefined ? cropArea : file.image!.cropArea;
        const filename = parse(file.name).name;

        const baseUrl = [`/${this.config.basePath}/images`];
        if (previewDamUrls) {
            baseUrl.push("preview");
        } else {
            const hash = this.createHash({
                fileId: file.id,
                filename,
                focalPoint: imageCropArea.focalPoint,
                cropWidth: imageCropArea.width,
                cropHeight: imageCropArea.height,
                cropX: imageCropArea.x,
                cropY: imageCropArea.y,
            });

            baseUrl.push(hash);
        }

        return [
            ...baseUrl,
            file.contentHash,
            file.id,
            (imageCropArea.focalPoint !== FocalPoint.SMART
                ? ["crop", imageCropArea.width, imageCropArea.height, imageCropArea.focalPoint, imageCropArea.x, imageCropArea.y]
                : ["crop", imageCropArea.focalPoint]
            ).join(":"),
            "resize:$resizeWidth:$resizeHeight",
            filename,
        ].join("/");
    }
}
