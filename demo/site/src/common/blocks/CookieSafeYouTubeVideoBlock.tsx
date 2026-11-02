"use client";
import { CookieSafe, useCookieApi, YouTubeVideoBlock } from "@dextinity/site-nextjs";
import { cookieIds } from "@src/util/cookieIds";
import clsx from "clsx";
import type { ComponentProps } from "react";

import { FallbackCookiePlaceholder, LoadingCookiePlaceholder } from "../helpers/CookiePlaceholders";
import styles from "./CookieSafeYouTubeVideoBlock.module.scss";

export const CookieSafeYouTubeVideoBlock = ({ aspectRatio = "16x9", fill, ...restProps }: ComponentProps<typeof YouTubeVideoBlock>) => {
    const { consentedCookies } = useCookieApi();

    return (
        // Gives the cookie placeholders the same size as the video.
        <div className={clsx(styles.root, fill && styles.fill)} style={!fill ? { "--aspect-ratio": aspectRatio.replace("x", "/") } : undefined}>
            <CookieSafe
                consented={consentedCookies.includes(cookieIds.thirdParty)}
                fallback={<FallbackCookiePlaceholder />}
                loading={<LoadingCookiePlaceholder />}
            >
                <YouTubeVideoBlock aspectRatio={aspectRatio} fill={fill} {...restProps} />
            </CookieSafe>
        </div>
    );
};
