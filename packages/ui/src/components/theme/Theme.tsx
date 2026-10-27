import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import type { ThemeColorScheme } from "../../theme/types";
import { defaultIcons } from "../icon/defaultIcons";
import type { IconSources } from "../icon/iconRegistry";
import { IconSourcesContext, useIconSources } from "../icon/iconSourcesContext";
import styles from "./Theme.module.scss";

export interface ThemeProps extends ComponentPropsWithoutRef<"div"> {
    /**
     * The active color scheme.
     *
     * @defaultValue "light"
     */
    colorScheme?: ThemeColorScheme | (string & {});
    /**
     * The source of every icon that `Icon` can show. Spread `defaultIcons` into it to replace only some icons; leave the spread out to replace all of them.
     *
     * @defaultValue `defaultIcons`, or the icons of the surrounding `Theme` in a nested one
     */
    icons?: IconSources;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Scopes the active color scheme and the icon set to its subtree. Wrap an application, or a section of one.
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme({ colorScheme = "light", icons, className, children, ...restProps }, ref) {
    const surroundingIcons = useIconSources();

    return (
        <IconSourcesContext.Provider value={icons ?? surroundingIcons ?? defaultIcons}>
            <div {...restProps} ref={ref} data-dextinity-color-scheme={colorScheme} className={clsx(styles.root, className)}>
                {children}
            </div>
        </IconSourcesContext.Provider>
    );
});
