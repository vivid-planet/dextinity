import { Archive, ChevronDown, Offline, Online } from "@dextinity/admin-icons";
import { Chip, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { parseResponse } from "hono/client";
import { type ReactElement, type ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { PageTreeNodeItem, PageTreeNodeVisibility } from "./pageTreeApi.types.js";
import { usePageTreeApi } from "./PageTreeApiProvider.js";
import { usePageTreeMutation } from "./usePageTreeMutation.js";

const visibilities: Record<PageTreeNodeVisibility, { icon: ReactElement; label: ReactNode }> = {
    Published: { icon: <Online color="success" />, label: <FormattedMessage id="dextinity.pageTree.published" defaultMessage="Published" /> },
    Unpublished: { icon: <Offline color="disabled" />, label: <FormattedMessage id="dextinity.pageTree.unpublished" defaultMessage="Unpublished" /> },
    Archived: { icon: <Archive color="disabled" />, label: <FormattedMessage id="dextinity.pageTree.archived" defaultMessage="Archived" /> },
};

export function PageVisibilityMenu({ node }: { node: PageTreeNodeItem }) {
    const { client } = usePageTreeApi();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const { mutate: updateVisibility } = usePageTreeMutation((visibility: PageTreeNodeVisibility) =>
        parseResponse(client.nodes[":id"].visibility.$put({ param: { id: node.id }, json: { visibility } })),
    );
    // The home page must stay published
    const isHome = node.slug === "home";

    return (
        <>
            <Chip
                icon={visibilities[node.visibility].icon}
                label={visibilities[node.visibility].label}
                deleteIcon={<ChevronDown />}
                onDelete={isHome ? undefined : (event) => setAnchorElement(event.currentTarget.parentElement)}
                onClick={isHome ? undefined : (event) => setAnchorElement(event.currentTarget)}
                variant="outlined"
                size="small"
            />
            <Menu anchorEl={anchorElement} open={anchorElement !== null} onClose={() => setAnchorElement(null)}>
                {Object.entries(visibilities).map(([visibility, { icon, label }]) => (
                    <MenuItem
                        key={visibility}
                        selected={visibility === node.visibility}
                        onClick={() => {
                            setAnchorElement(null);
                            if (visibility !== node.visibility) {
                                updateVisibility(visibility as PageTreeNodeVisibility);
                            }
                        }}
                    >
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={label} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
