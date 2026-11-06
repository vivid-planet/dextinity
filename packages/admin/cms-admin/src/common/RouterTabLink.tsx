import { type AnchorHTMLAttributes, forwardRef } from "react";
import { Link } from "react-router-dom";

/** The `tab` slot of the ui `Tabs` for tabs that are routes: a router link to the tab's `href`. */
export const RouterTabLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(function RouterTabLink(
    { href, ...props },
    ref,
) {
    return <Link {...props} ref={ref} to={href} />;
});
