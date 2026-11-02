import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

type BreadcrumbLinkProps = Omit<RouterLinkProps, "to"> & { to?: RouterLinkProps["to"]; href?: string };

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ href, to, ...rest }, ref) => (
    <RouterLink ref={ref} to={to ?? href ?? ""} {...rest} />
));
