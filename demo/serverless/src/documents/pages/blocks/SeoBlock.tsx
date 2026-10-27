import { createSeoBlock } from "@dextinity/cms-admin";
import { PixelImageBlock } from "@dextinity/serverless/client";

export const SeoBlock = createSeoBlock({ image: PixelImageBlock });
