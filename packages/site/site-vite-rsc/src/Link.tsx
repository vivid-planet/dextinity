"use client";

import type { ComponentProps, MouseEvent } from "react";

import { isClientNavigationClick } from "./isClientNavigationClick.js";
import { useRouter } from "./RouterProvider.js";

type LinkProps = ComponentProps<"a"> & {
    href: string;
    /** Replaces the current history entry instead of adding a new one */
    replace?: boolean;
    /** Scrolls to the top or the hash of the URL after navigating, defaults to true */
    scroll?: boolean;
};

/**
 * Navigates to pages of this site without a full page load. Use a plain `<a>` for everything else, e.g., DAM files
 */
export function Link({ href, replace, scroll = true, onClick, ...anchorProps }: LinkProps) {
    const router = useRouter();

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        onClick?.(event);
        if (!isClientNavigationClick(event.nativeEvent, event.currentTarget)) {
            return;
        }
        event.preventDefault();
        if (replace) {
            router.replace(href, { scroll });
        } else {
            router.push(href, { scroll });
        }
    }

    return <a {...anchorProps} href={href} onClick={handleClick} />;
}
