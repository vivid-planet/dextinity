export const defaultIconNames = {
    "arrow-right": true,
    favorite: true,
} satisfies Record<string, true>;

/**
 * The names of the icons that ship with this package.
 */
export type DefaultIconRegistry = typeof defaultIconNames;

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
