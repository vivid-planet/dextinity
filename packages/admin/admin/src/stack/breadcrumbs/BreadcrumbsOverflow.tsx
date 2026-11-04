import { ChevronRight } from "@dextinity/admin-icons";
import { Link, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { css } from "@mui/material/styles";
import { type ReactNode, useRef, useState } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { BreadcrumbItem } from "../Stack";
import { BreadcrumbLink } from "./BreadcrumbLink";
import type { StackBreadcrumbsClassKey, StackBreadcrumbsProps } from "./StackBreadcrumbs";

interface BreadcrumbsOverflowProps {
    items: BreadcrumbItem[];
    linkText: ReactNode;
    slotProps: StackBreadcrumbsProps["slotProps"];
}

const OverflowLink = createComponentSlot(Link)<StackBreadcrumbsClassKey>({
    componentName: "StackBreadcrumbs",
    slotName: "overflowLink",
    classesResolver() {
        return ["link"];
    },
})(
    ({ theme }) => css`
        font-size: 13px;
        line-height: 14px;
        font-weight: ${theme.typography.fontWeightMedium};
        color: ${theme.palette.grey[600]};
        text-decoration-color: currentColor;
        cursor: pointer;
        padding-top: 12px;
        padding-bottom: 12px;
    `,
);

export const BreadcrumbsOverflow = ({ items, linkText, slotProps }: BreadcrumbsOverflowProps) => {
    const [showOverflowMenu, setShowOverflowMenu] = useState<boolean>(false);
    const overflowLinkRef = useRef<HTMLAnchorElement>(null);

    return (
        <>
            <OverflowLink ref={overflowLinkRef} {...slotProps?.overflowLink} onClick={() => setShowOverflowMenu(true)} variant="body2">
                {linkText}
            </OverflowLink>
            <Menu open={showOverflowMenu} onClose={() => setShowOverflowMenu(false)} anchorEl={overflowLinkRef.current}>
                {items.map(({ id, url, title }) => (
                    <MenuItem key={id} component={BreadcrumbLink} to={url} onClick={() => setShowOverflowMenu(false)}>
                        <ListItemIcon>
                            <ChevronRight />
                        </ListItemIcon>
                        <ListItemText primary={title} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
