import { Inject, Injectable, Logger } from "@nestjs/common";
import { promisify } from "util";
import { inflate as inflateCallback } from "zlib";

import { BlobStorageBackendService } from "../../blob-storage/backends/blob-storage-backend.service";
import { createHashedPath } from "../../blob-storage/utils/create-hashed-path.util";
import { Extension, ResizingType } from "../../imgproxy/imgproxy.enum";
import { ImgproxyService } from "../../imgproxy/imgproxy.service";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG } from "../dam.constants";
import { DominantColorCalculatorInterface } from "../dominant-color-calculator.interface";

const inflate = promisify(inflateCallback);

@Injectable()
export class DamDominantColorService implements DominantColorCalculatorInterface {
    private readonly logger = new Logger(DamDominantColorService.name);

    constructor(
        @Inject(DAM_CONFIG) private readonly config: DamConfig,
        private readonly imgproxyService: ImgproxyService,
        private readonly blobStorageBackendService: BlobStorageBackendService,
    ) {}

    async calculateDominantColor(contentHash: string): Promise<string | undefined> {
        const path = this.imgproxyService
            .builder()
            .resize(ResizingType.AUTO, 1)
            .format(Extension.PNG)
            .generateUrl(
                `${this.blobStorageBackendService.getBackendFilePathPrefix()}${this.config.filesDirectory}/${createHashedPath(contentHash)}`,
            );

        const imgUrl = this.imgproxyService.getSignedUrl(path);
        let imageResponse: Response;
        try {
            imageResponse = await fetch(imgUrl);
        } catch (error) {
            this.logger.error("Failed to calculate dominant color: imgproxy is not available", error);
            return undefined;
        }

        if (!imageResponse.ok) {
            this.logger.error(`Failed to calculate dominant color: imgproxy returned ${imageResponse.status} ${imageResponse.statusText}`);
            return undefined;
        }

        try {
            const arrayBuffer = await imageResponse.arrayBuffer();
            const pngBuffer = Buffer.from(arrayBuffer);

            // Parse the dominant color from the 1x1 PNG produced by imgproxy
            return await this.parsePngPixelColor(pngBuffer);
        } catch (error) {
            this.logger.error("Failed to calculate dominant color: could not parse imgproxy response", error);
            return undefined;
        }
    }

    private async parsePngPixelColor(pngBuffer: Buffer): Promise<string | undefined> {
        // PNG: 8-byte signature, then chunks (4-byte length + 4-byte type + data + 4-byte CRC)
        let offset = 8;
        let colorType = -1;
        let palette: Buffer | undefined;

        while (offset < pngBuffer.length) {
            const length = pngBuffer.readUInt32BE(offset);
            const type = pngBuffer.toString("ascii", offset + 4, offset + 8);
            const data = pngBuffer.subarray(offset + 8, offset + 8 + length);

            if (type === "IHDR") {
                colorType = data[9];
            } else if (type === "PLTE") {
                palette = data;
            } else if (type === "IDAT") {
                const decompressed = await inflate(data);
                // Decompressed scanline: [filter_byte, pixel_data...]
                let r: number, g: number, b: number;
                if (colorType === 3 && palette) {
                    // Indexed color: pixel value is a palette index
                    const index = decompressed[1] * 3;
                    [r, g, b] = [palette[index], palette[index + 1], palette[index + 2]];
                } else if (colorType === 0) {
                    // Grayscale
                    const gray = decompressed[1];
                    [r, g, b] = [gray, gray, gray];
                } else {
                    // RGB (type 2) or RGBA (type 6): R, G, B are at bytes 1-3
                    [r, g, b] = [decompressed[1], decompressed[2], decompressed[3]];
                }
                return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
            }

            offset += 12 + length;
        }

        this.logger.warn("Failed to calculate dominant color: no IDAT chunk found in PNG");
        return undefined;
    }
}
