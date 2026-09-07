import clsx from "clsx";

import styles from "./AnimateGroup.module.scss";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

const disabledStyles: Record<Breakpoint, string> = {
    xs: styles.animateGroupDisabledXs,
    sm: styles.animateGroupDisabledSm,
    md: styles.animateGroupDisabledMd,
    lg: styles.animateGroupDisabledLg,
    xl: styles.animateGroupDisabledXl,
};

/**
 * Class names that make an existing element an animation group: every `AnimateBoxInOnScroll` inside it reveals on
 * the group's timeline instead of its own, so the members animate together. Applied to an element the block already
 * renders, which is why this is class names rather than a component.
 */
export function animateGroup(disabledBreakpoints: Breakpoint[] = []) {
    return clsx(
        styles.animateGroup,
        disabledBreakpoints.map((breakpoint) => disabledStyles[breakpoint]),
    );
}
