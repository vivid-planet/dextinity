import { Home, Link as LinkIcon } from "@dextinity/admin-icons";
import type { SvgIconProps } from "@mui/material";
import type { JSX, ReactNode } from "react";

import { usePageTreeConfig } from "../pageTreeConfig";
import type { PageTreePage } from "./usePageTree";

interface PageTypeIconProps {
    page: PageTreePage;
    disabled?: boolean;
}

export function PageTypeIcon({ page, disabled }: PageTypeIconProps): JSX.Element {
    let iconColor: SvgIconProps["color"] = "primary";
    const { documentTypes } = usePageTreeConfig();
    const documentType = documentTypes[page.documentType];
    let Icon: (props: SvgIconProps<"svg">) => ReactNode;

    if (page.slug === "home") {
        Icon = Home;
    } else if (page.documentType === "Link") {
        Icon = LinkIcon;
        iconColor = "inherit";
    } else {
        if (page.hideInMenu && documentType.hideInMenuIcon) {
            Icon = documentType.hideInMenuIcon;
        } else {
            Icon = documentType.menuIcon;
        }
    }

    if (page.visibility !== "Published" || disabled) {
        iconColor = "disabled";
    }

    return <Icon color={iconColor} />;
}
