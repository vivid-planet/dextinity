"use client";
import { CookieSafe, useCookieApi, YouTubeVideoBlock } from "@dextinity/site-nextjs";
import { cookieIds } from "@src/util/cookieIds";
import type { ComponentProps } from "react";

import { FallbackCookiePlaceholder, LoadingCookiePlaceholder } from "../helpers/CookiePlaceholders";
import styles from "./CookieSafeYouTubeVideoBlock.module.scss";

// TODO: use aspect ratio from props
const aspectRatio = "16x9";

export const CookieSafeYouTubeVideoBlock = (props: ComponentProps<typeof YouTubeVideoBlock>) => {
    const { consentedCookies } = useCookieApi();

    return (
        <div className={styles.root} style={{ aspectRatio: aspectRatio.replace("x", "/") }}>
            <CookieSafe
                consented={consentedCookies.includes(cookieIds.thirdParty)}
                fallback={<FallbackCookiePlaceholder />}
                loading={<LoadingCookiePlaceholder />}
            >
                <YouTubeVideoBlock aspectRatio={aspectRatio} {...props} />
            </CookieSafe>
        </div>
    );
};
