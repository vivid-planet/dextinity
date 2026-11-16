import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps, type To } from "react-router";

type BreadcrumbLinkProps = Omit<RouterLinkProps, "to"> & { to?: To; href?: string };

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ href, to, ...rest }, ref) => (
    <RouterLink ref={ref} to={to ?? href ?? ""} {...rest} />
));
