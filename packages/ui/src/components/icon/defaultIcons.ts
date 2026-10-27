import type { DefaultIconName, IconSource } from "./iconRegistry";

/**
 * The sources of the icons that ship with this package.
 */
export const defaultIcons: Record<DefaultIconName, IconSource> = {
    "arrow-right": new URL("../../../svg/arrow-right.svg#icon", import.meta.url).href,
    "confluence-color": { url: new URL("../../../svg/confluence-color.svg#icon", import.meta.url).href, hasOwnColors: true },
    favorite: new URL("../../../svg/favorite.svg#icon", import.meta.url).href,
    "jira-color": { url: new URL("../../../svg/jira-color.svg#icon", import.meta.url).href, hasOwnColors: true },
    "vimeo-filled-color": { url: new URL("../../../svg/vimeo-filled-color.svg#icon", import.meta.url).href, hasOwnColors: true },
    "youtube-filled-color": { url: new URL("../../../svg/youtube-filled-color.svg#icon", import.meta.url).href, hasOwnColors: true },
};
