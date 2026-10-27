import { ChevronDown, ChevronRight } from "@dextinity/admin-icons";
import { IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { DragEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { usePageTreeApi } from "./PageTreeApiProvider.js";
import { PageTreeNodeActions } from "./PageTreeNodeActions.js";
import type { PageTreeRowItem } from "./pageTreeRows.js";
import { PageTypeIcon } from "./PageTypeIcon.js";
import { PageVisibilityMenu } from "./PageVisibilityMenu.js";

export type DropPlacement = "before" | "after" | "inside";

interface PageTreeRowProps {
    row: PageTreeRowItem;
    onToggleExpand: (id: string) => void;
    isDraggable: boolean;
    /** Whether the node being dragged may be dropped onto this row */
    canDropOnto: boolean;
    dropPlacement?: DropPlacement;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
    onDragOver: (placement: DropPlacement) => void;
    onDrop: (placement: DropPlacement) => void;
}

/** The upper and lower quarter of a row insert before and after it, the middle inserts as its last subpage */
function placementAt(event: DragEvent<HTMLElement>): DropPlacement {
    const { top, height } = event.currentTarget.getBoundingClientRect();
    const offset = (event.clientY - top) / height;
    return offset < 0.25 ? "before" : offset > 0.75 ? "after" : "inside";
}

export function PageTreeRow({
    row,
    onToggleExpand,
    isDraggable,
    canDropOnto,
    dropPlacement,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}: PageTreeRowProps) {
    const intl = useIntl();
    const { documentTypes } = usePageTreeApi();
    const { node, level, hasChildren, isExpanded } = row;
    const isArchived = node.visibility === "Archived";

    return (
        <Row
            dropPlacement={dropPlacement}
            draggable={isDraggable}
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", node.id);
                onDragStart(node.id);
            }}
            onDragEnd={onDragEnd}
            onDragOver={(event) => {
                if (canDropOnto) {
                    event.preventDefault();
                    onDragOver(placementAt(event));
                }
            }}
            onDrop={(event) => {
                event.preventDefault();
                onDrop(placementAt(event));
            }}
        >
            <NameCell level={level}>
                <ExpandButton
                    size="small"
                    isHidden={!hasChildren}
                    onClick={() => onToggleExpand(node.id)}
                    aria-label={
                        isExpanded
                            ? intl.formatMessage({ id: "dextinity.pageTree.collapse", defaultMessage: "Collapse" })
                            : intl.formatMessage({ id: "dextinity.pageTree.expand", defaultMessage: "Expand" })
                    }
                >
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </ExpandButton>
                <PageTypeIcon node={node} />
                <NameAndPath>
                    <Typography variant="subtitle2" color={isArchived || node.visibility === "Unpublished" ? "textSecondary" : "textPrimary"} noWrap>
                        {node.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" noWrap>
                        {node.path}
                    </Typography>
                </NameAndPath>
            </NameCell>
            <Typography variant="body2" color="textSecondary" noWrap>
                {documentTypes[node.documentType]?.label ?? node.documentType}
                {node.hideInMenu && (
                    <>
                        {" · "}
                        <FormattedMessage id="dextinity.pageTree.hiddenInMenu" defaultMessage="Hidden in menu" />
                    </>
                )}
            </Typography>
            <div>
                <PageVisibilityMenu node={node} />
            </div>
            <Actions>
                <PageTreeNodeActions node={node} />
            </Actions>
        </Row>
    );
}

export const pageTreeGridColumns = "minmax(0, 1fr) 220px 160px 96px";

const Row = styled("div", { shouldForwardProp: (prop) => prop !== "dropPlacement" })<{ dropPlacement?: DropPlacement }>`
    display: grid;
    grid-template-columns: ${pageTreeGridColumns};
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(1, 2)};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme, dropPlacement }) => (dropPlacement === "inside" ? theme.palette.action.selected : theme.palette.background.paper)};
    box-shadow: ${({ theme, dropPlacement }) =>
        dropPlacement === "before"
            ? `inset 0 2px 0 ${theme.palette.primary.main}`
            : dropPlacement === "after"
              ? `inset 0 -2px 0 ${theme.palette.primary.main}`
              : "none"};

    &:hover {
        background-color: ${({ theme }) => theme.palette.action.hover};
    }

    &[draggable="true"] {
        cursor: grab;
    }
`;

const NameCell = styled("div", { shouldForwardProp: (prop) => prop !== "level" })<{ level: number }>`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    min-width: 0;
    padding-left: ${({ theme, level }) => theme.spacing(level * 5)};
`;

const ExpandButton = styled(IconButton, { shouldForwardProp: (prop) => prop !== "isHidden" })<{ isHidden: boolean }>`
    visibility: ${({ isHidden }) => (isHidden ? "hidden" : "visible")};
`;

const Actions = styled("div")`
    display: flex;
    justify-content: flex-end;
`;

const NameAndPath = styled("div")`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;
