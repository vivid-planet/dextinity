import type { DefaultIconName } from "./iconRegistry";

/**
 * The URLs of the icons that ship with this package.
 */
export const defaultIcons: Record<DefaultIconName, string> = {
    "arrow-right": new URL("../../../svg/arrow-right.svg#icon", import.meta.url).href,
    favorite: new URL("../../../svg/favorite.svg#icon", import.meta.url).href,
};
