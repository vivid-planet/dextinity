import base64url from "base64url";

import { type Extension, Gravity, ResizingType } from "./imgproxy.enum";

export class ImgproxyBuilder {
    private defaultQuality: number;
    private options: { [key: string]: string | undefined } = {};

    constructor(quality: number) {
        this.defaultQuality = quality;
    }

    crop(width: number, height: number, gravity: Gravity = Gravity.CENTER, xOffset = 0, yOffset = 0): this {
        const options = [width, height, gravity];
        if (gravity !== Gravity.SMART) {
            options.push(xOffset, yOffset);
        }

        return this.setOption("crop", options.join(":"));
    }

    resize(type: ResizingType = ResizingType.AUTO, width: number, height = 0, enlarge = false): this {
        return this.setOption("resize", [type, width, height, enlarge ? 1 : 0].join(":"));
    }

    dpr(dpr = 1): this {
        return this.setOption("dpr", `${dpr}`);
    }

    quality(quality: number = this.defaultQuality): this {
        return this.setOption("quality", `${quality}`);
    }

    format(extension: Extension): this {
        return this.setOption("format", extension);
    }

    setOption(option: string, value: string): this {
        this.options[option] = value;

        return this;
    }

    generateUrl(sourceUrl: string): string {
        const url = Object.keys(this.options)
            .filter((option) => !!this.options[option])
            .map((option) => `${option}:${this.options[option]}`)
            .join("/");

        return `/${[url, base64url(sourceUrl)].join("/")}`;
    }
}
