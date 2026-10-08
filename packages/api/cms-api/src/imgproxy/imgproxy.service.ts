import { Inject, Injectable } from "@nestjs/common";
import { createHmac } from "crypto";

import { ImgproxyBuilder } from "./imgproxy.builder";
import { IMGPROXY_CONFIG } from "./imgproxy.constants";

export interface ImgproxyConfig {
    url: string;
    salt: string;
    key: string;
    quality: number;
}

@Injectable()
export class ImgproxyService {
    url = this.config.url;
    salt = this.config.salt;
    key = this.config.key;

    constructor(@Inject(IMGPROXY_CONFIG) private readonly config: ImgproxyConfig) {}

    builder(): ImgproxyBuilder {
        return new ImgproxyBuilder(this.config.quality);
    }

    getSignedUrl(path: string): string {
        return `${this.url}/${this.sign(path)}${path}`;
    }

    sign(target: string): string {
        const hmac = createHmac("sha256", Buffer.from(this.key, "hex"));
        hmac.update(Buffer.from(this.salt, "hex"));
        hmac.update(target);
        return hmac.digest("base64url");
    }
}
