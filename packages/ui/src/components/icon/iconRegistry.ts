/**
 * The names of the icons that ship with this package.
 */
export interface DefaultIconRegistry {
    "arrow-right": true;
    favorite: true;
}

/**
 * The names that `Icon` accepts. Extend it through module augmentation to add an icon:
 *
 * ```ts
 * declare module "@dextinity/ui" {
 *     interface IconRegistry {
 *         "my-icon": true;
 *     }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- consumers extend it through module augmentation
export interface IconRegistry extends DefaultIconRegistry {}

export type DefaultIconName = keyof DefaultIconRegistry;

export type IconName = keyof IconRegistry;

/**
 * An icon with its own colors, which it keeps instead of taking the text color.
 */
export interface IconSourceWithOwnColors {
    /** The URL of the SVG file, followed by `#icon`. */
    url: string;
    hasOwnColors: true;
}

/**
 * The URL of an icon's SVG file, followed by `#icon`, or an icon with its own colors.
 */
export type IconSource = string | IconSourceWithOwnColors;

/**
 * The source of every icon.
 */
export type IconSources = Record<IconName, IconSource>;
