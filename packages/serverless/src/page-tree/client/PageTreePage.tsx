import {
    Button,
    ClearInputAdornment,
    FillSpace,
    Loading,
    MainContent,
    Stack,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarItem,
    ToolbarTitleItem,
    Tooltip,
} from "@dextinity/admin";
import { Add, Search, TreeCollapseAll, TreeExpandAll } from "@dextinity/admin-icons";
import { FormControlLabel, IconButton, InputAdornment, InputBase, Paper, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { pageTreeQueryKeys } from "./pageTreeApi.types.js";
import { usePageTreeApi } from "./PageTreeApiProvider.js";
import { PageTreeDocumentEditor } from "./PageTreeDocumentEditor.js";
import { PageTreeNodeDialog } from "./PageTreeNodeDialog.js";
import { type DropPlacement, pageTreeGridColumns, PageTreeRow } from "./PageTreeRow.js";
import { dropPosition, isDescendantOrSelf, visibleRows } from "./pageTreeRows.js";
import { usePageTreeMutation } from "./usePageTreeMutation.js";

/**
 * The page tree of one category: pages with their path, document type and visibility, ordered and nested by drag and drop. Editing a
 * page opens the editor of its document.
 */
export function PageTreePage({ category }: { category: string }) {
    const intl = useIntl();
    const { categories } = usePageTreeApi();

    return (
        <Stack topLevelTitle={categories.find((item) => item.category === category)?.label}>
            <StackSwitch initialPage="tree">
                <StackPage name="tree">
                    <PageTree category={category} />
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "dextinity.pageTree.editPage", defaultMessage: "Edit page" })}>
                    {(id: string) => <PageTreeDocumentEditor id={id} />}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

function PageTree({ category }: { category: string }) {
    const intl = useIntl();
    const { client, scope, categories } = usePageTreeApi();
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());
    const [showArchived, setShowArchived] = useState(false);
    const [query, setQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [draggedId, setDraggedId] = useState<string>();
    const [dropTarget, setDropTarget] = useState<{ id: string; placement: DropPlacement }>();

    const { data: nodes, isLoading } = useQuery({
        queryKey: pageTreeQueryKeys.nodes(scope, category),
        queryFn: () => parseResponse(client.nodes.$get({ query: { ...scope, category } })),
    });
    const { mutate: move } = usePageTreeMutation((input: { ids: string[]; parentId: string | null; pos: number }) =>
        parseResponse(client.nodes.move.$post({ json: input })),
    );

    const rows = useMemo(() => visibleRows(nodes ?? [], { expandedIds, showArchived, query }), [nodes, expandedIds, showArchived, query]);
    const isSearching = query.trim() !== "";
    const categoryLabel = categories.find((item) => item.category === category)?.label;

    const toggleExpand = (id: string) => {
        setExpandedIds((ids) => {
            const updatedIds = new Set(ids);
            if (updatedIds.has(id)) {
                updatedIds.delete(id);
            } else {
                updatedIds.add(id);
            }
            return updatedIds;
        });
    };

    const handleDrop = (targetId: string, placement: DropPlacement) => {
        const target = nodes?.find((node) => node.id === targetId);
        if (draggedId && target && draggedId !== targetId) {
            move({ ids: [draggedId], ...dropPosition(nodes ?? [], { draggedId, target, placement }) });
            if (placement === "inside") {
                setExpandedIds((ids) => new Set([...ids, targetId]));
            }
        }
        setDraggedId(undefined);
        setDropTarget(undefined);
    };

    return (
        <>
            <StackToolbar>
                <ToolbarTitleItem>{categoryLabel}</ToolbarTitleItem>
                <ToolbarItem>
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={intl.formatMessage({ id: "dextinity.pageTree.search", defaultMessage: "Search pages" })}
                        startAdornment={
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        }
                        endAdornment={query !== "" && <ClearInputAdornment position="end" onClick={() => setQuery("")} />}
                    />
                </ToolbarItem>
                <FillSpace />
                <ToolbarItem>
                    <Tooltip title={intl.formatMessage({ id: "dextinity.pageTree.expandAll", defaultMessage: "Expand all" })}>
                        <IconButton
                            onClick={() => setExpandedIds(new Set(nodes?.map((node) => node.id)))}
                            aria-label={intl.formatMessage({ id: "dextinity.pageTree.expandAll", defaultMessage: "Expand all" })}
                        >
                            <TreeExpandAll />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={intl.formatMessage({ id: "dextinity.pageTree.collapseAll", defaultMessage: "Collapse all" })}>
                        <IconButton
                            onClick={() => setExpandedIds(new Set())}
                            aria-label={intl.formatMessage({ id: "dextinity.pageTree.collapseAll", defaultMessage: "Collapse all" })}
                        >
                            <TreeCollapseAll />
                        </IconButton>
                    </Tooltip>
                </ToolbarItem>
                <ToolbarItem>
                    <FormControlLabel
                        control={<Switch checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />}
                        label={<FormattedMessage id="dextinity.pageTree.showArchived" defaultMessage="Archived pages" />}
                    />
                </ToolbarItem>
                <ToolbarActions>
                    <Button variant="primary" startIcon={<Add />} onClick={() => setIsAddDialogOpen(true)}>
                        <FormattedMessage id="dextinity.pageTree.addPage" defaultMessage="Add page" />
                    </Button>
                </ToolbarActions>
            </StackToolbar>
            <MainContent fullHeight>
                <TreePaper>
                    <HeaderRow>
                        <Typography variant="subtitle2">
                            <FormattedMessage id="dextinity.pageTree.page" defaultMessage="Page" />
                        </Typography>
                        <Typography variant="subtitle2">
                            <FormattedMessage id="dextinity.pageTree.documentType" defaultMessage="Document type" />
                        </Typography>
                        <Typography variant="subtitle2">
                            <FormattedMessage id="dextinity.pageTree.visibility" defaultMessage="Visibility" />
                        </Typography>
                    </HeaderRow>
                    {isLoading ? (
                        <Loading behavior="fillParent" />
                    ) : rows.length === 0 ? (
                        <EmptyState variant="body2" color="textSecondary">
                            <FormattedMessage id="dextinity.pageTree.noPages" defaultMessage="No pages yet" />
                        </EmptyState>
                    ) : (
                        rows.map((row) => (
                            <PageTreeRow
                                key={row.node.id}
                                row={row}
                                onToggleExpand={toggleExpand}
                                // While searching, rows are left out, so positions can't be determined from them
                                isDraggable={!isSearching && row.node.visibility !== "Archived"}
                                canDropOnto={
                                    draggedId !== undefined &&
                                    row.node.visibility !== "Archived" &&
                                    !isDescendantOrSelf(nodes ?? [], { id: row.node.id, ancestorId: draggedId })
                                }
                                dropPlacement={dropTarget?.id === row.node.id ? dropTarget.placement : undefined}
                                onDragStart={setDraggedId}
                                onDragEnd={() => {
                                    setDraggedId(undefined);
                                    setDropTarget(undefined);
                                }}
                                onDragOver={(placement) => setDropTarget({ id: row.node.id, placement })}
                                onDrop={(placement) => handleDrop(row.node.id, placement)}
                            />
                        ))
                    )}
                </TreePaper>
            </MainContent>
            {isAddDialogOpen && <PageTreeNodeDialog category={category} onClose={() => setIsAddDialogOpen(false)} />}
        </>
    );
}

const TreePaper = styled(Paper)`
    height: 100%;
    overflow-y: auto;
    position: relative;
`;

const HeaderRow = styled("div")`
    display: grid;
    grid-template-columns: ${pageTreeGridColumns};
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${({ theme }) => theme.palette.background.paper};
`;

const EmptyState = styled(Typography)`
    padding: ${({ theme }) => theme.spacing(4)};
    text-align: center;
`;
