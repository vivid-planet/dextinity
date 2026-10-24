"use client";
import { CookieSafe, useCookieApi, YouTubeVideoBlock } from "@dextinity/site-react";
import { cookieIds } from "@src/util/cookieIds";
import type { ComponentProps } from "react";

import { FallbackCookiePlaceholder, LoadingCookiePlaceholder } from "../helpers/CookiePlaceholders";
import { VideoPreviewImage } from "../helpers/VideoPreviewImage";
import styles from "./CookieSafeYouTubeVideoBlock.module.scss";

// TODO: use aspect ratio from props
const aspectRatio = "16x9";

type Props = Omit<ComponentProps<typeof YouTubeVideoBlock>, "renderPreviewImage">;

export const CookieSafeYouTubeVideoBlock = (props: Props) => {
    const { consentedCookies } = useCookieApi();

    return (
        <div className={styles.root} style={{ aspectRatio: aspectRatio.replace("x", "/") }}>
            <CookieSafe
                consented={consentedCookies.includes(cookieIds.thirdParty)}
                fallback={<FallbackCookiePlaceholder />}
                loading={<LoadingCookiePlaceholder />}
            >
                <YouTubeVideoBlock aspectRatio={aspectRatio} renderPreviewImage={(props) => <VideoPreviewImage {...props} />} {...props} />
            </CookieSafe>
        </div>
    );
};
