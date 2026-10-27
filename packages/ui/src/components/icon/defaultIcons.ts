import type { DefaultIconName, IconSource } from "./iconRegistry";

/**
 * The sources of the icons that ship with this package.
 */
export const defaultIcons: Record<DefaultIconName, IconSource> = {
    "arrow-right": new URL("../../../svg/arrow-right.svg#icon", import.meta.url).href,
    favorite: new URL("../../../svg/favorite.svg#icon", import.meta.url).href,
};
