import { Dialog } from "@dextinity/admin";
import { Search } from "@dextinity/admin-icons";
import { BlockAdminComponentButton } from "@dextinity/cms-admin";
import { DialogContent, InputAdornment, InputBase, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage, useIntl } from "react-intl";

import { type PageTreeNodeItem, pageTreeQueryKeys } from "../pageTreeApi.types.js";
import { usePageTreeApi } from "../PageTreeApiProvider.js";
import { visibleRows } from "../pageTreeRows.js";
import { PageTypeIcon } from "../PageTypeIcon.js";

export type PageTreeSelectNode = Pick<PageTreeNodeItem, "id" | "name" | "path" | "documentType">;

/** Chooses a page of the current scope from all categories, for links. Archived pages can't be chosen. */
export function PageTreeSelect({ input }: FieldRenderProps<PageTreeSelectNode | undefined, HTMLElement>) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const node = input.value || undefined;

    return (
        <>
            <BlockAdminComponentButton onClick={() => setIsDialogOpen(true)} size="large">
                {node ? (
                    <SelectedPage>
                        <span>{node.name}</span>
                        <SelectedPagePath>{node.path}</SelectedPagePath>
                    </SelectedPage>
                ) : (
                    <FormattedMessage id="dextinity.pageTree.select.choosePage" defaultMessage="Choose page" />
                )}
            </BlockAdminComponentButton>
            {isDialogOpen && (
                <PageTreeSelectDialog
                    selectedId={node?.id}
                    onClose={() => setIsDialogOpen(false)}
                    onSelect={({ id, name, path, documentType }) => {
                        setIsDialogOpen(false);
                        input.onChange({ id, name, path, documentType });
                    }}
                />
            )}
        </>
    );
}

interface PageTreeSelectDialogProps {
    selectedId?: string;
    onClose: () => void;
    onSelect: (node: PageTreeNodeItem) => void;
}

function PageTreeSelectDialog({ selectedId, onClose, onSelect }: PageTreeSelectDialogProps) {
    const intl = useIntl();
    const { client, scope, categories } = usePageTreeApi();
    const [query, setQuery] = useState("");
    const { data: nodes = [] } = useQuery({
        queryKey: pageTreeQueryKeys.nodes(scope),
        queryFn: () => parseResponse(client.nodes.$get({ query: scope })),
    });
    const allIds = new Set(nodes.map((node) => node.id));

    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            title={intl.formatMessage({ id: "dextinity.pageTree.select.choosePage", defaultMessage: "Choose page" })}
        >
            <DialogContent>
                <InputBase
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={intl.formatMessage({ id: "dextinity.pageTree.search", defaultMessage: "Search pages" })}
                    fullWidth
                    autoFocus
                    startAdornment={
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    }
                />
                {categories.map(({ category, label }) => {
                    const rows = visibleRows(
                        nodes.filter((node) => node.category === category),
                        { expandedIds: allIds, showArchived: false, query },
                    );
                    return (
                        rows.length > 0 && (
                            <List key={category} dense subheader={<ListSubheader disableGutters>{label}</ListSubheader>}>
                                {rows.map(({ node, level }) => (
                                    <IndentedListItemButton
                                        key={node.id}
                                        level={level}
                                        selected={node.id === selectedId}
                                        onClick={() => onSelect(node)}
                                    >
                                        <ListItemIcon>
                                            <PageTypeIcon node={node} />
                                        </ListItemIcon>
                                        <ListItemText primary={node.name} secondary={node.path} />
                                    </IndentedListItemButton>
                                ))}
                            </List>
                        )
                    );
                })}
            </DialogContent>
        </Dialog>
    );
}

const SelectedPage = styled("span")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const SelectedPagePath = styled("span")`
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: normal;
`;

const IndentedListItemButton = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== "level" })<{ level: number }>`
    padding-left: ${({ theme, level }) => theme.spacing(1 + level * 3)};
`;
