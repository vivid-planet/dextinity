import type { CloudflareAccessConfig, DamConfig } from "@dextinity/serverless/server";
import { z } from "zod";

import { imageAspectRatios } from "../shared/blocks";

const environmentVariables = z.object({
    DATABASE_DIALECT: z.enum(["sqlite", "postgresql"]),
    DAM_SECRET: z.string().min(16),
    ACCESS_TEAM_DOMAIN: z.url(),
    ACCESS_AUDIENCE: z.string().min(1),
});

const imageSizes = [16, 32, 48, 64, 96, 128, 256, 320, 384];
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3200, 3840];

export type Config = ReturnType<typeof createConfig>;

/** Takes the environment as an argument because Cloudflare Workers pass it with each request instead of `process.env`. */
export function createConfig(environment: Record<string, unknown>) {
    const variables = environmentVariables.parse(environment);

    return {
        databaseDialect: variables.DATABASE_DIALECT,
        access: { teamDomain: variables.ACCESS_TEAM_DOMAIN, audience: variables.ACCESS_AUDIENCE } satisfies CloudflareAccessConfig,
        dam: {
            secret: variables.DAM_SECRET,
            allowedImageSizes: [...imageSizes, ...deviceSizes],
            allowedAspectRatios: [...imageAspectRatios],
            filesDirectory: "dam-files",
            maxFileSize: 100,
            maxSrcResolution: 70,
            includeFormatExtensionInImageUrls: true,
        } satisfies DamConfig,
    };
}
