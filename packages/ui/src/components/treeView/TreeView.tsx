import { clsx } from "clsx";
import {
    type CSSProperties,
    type DragEvent,
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
    useEffect,
    useId,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Checkbox } from "../checkbox/Checkbox";
import { Icon } from "../icon/Icon";
import { StatusIndicator, type StatusIndicatorStatus } from "../statusIndicator/StatusIndicator";
import { readTooltipDelay, Tooltip } from "../tooltip/Tooltip";
import styles from "./TreeView.module.scss";

/** A node of a `TreeView`. */
export interface TreeNode {
    /** A stable id. */
    id: string;
    /** The name. */
    label: string;
    /**
     * Sets the icon before the name.
     *
     * @defaultValue `"page"`
     */
    type?: "page" | "link" | "folder";
    /** Replaces the icon of `type`, e.g. `<Icon name="home" />` for the home page. */
    icon?: ReactNode;
    /** Shown as a dot at the end of the row, with the text in a tooltip. */
    status?: StatusIndicatorStatus;
    /** Shown on hover, e.g. the page's URL path. */
    path?: string;
    /**
     * Shows the "hidden in menu" symbol after the name.
     *
     * @defaultValue `false`
     */
    hiddenInMenu?: boolean;
    /** The child nodes. */
    children?: TreeNode[];
}

/** Where a dragged node is dropped, relative to the target node. */
export interface TreeViewMove {
    /** The dragged node. */
    id: string;
    /** The node it was dropped on. */
    targetId: string;
    /** `before` and `after` make it a sibling of the target, `inside` its last child. */
    position: "before" | "after" | "inside";
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TreeViewOwnerState = {
    checkable: boolean;
    draggable: boolean;
    filtered: boolean;
};

export interface TreeViewLabels {
    /** The accessible name of the "hidden in menu" symbol. */
    hiddenInMenu: string;
}

export const defaultTreeViewLabels: TreeViewLabels = {
    hiddenInMenu: "Hidden in menu",
};

export interface TreeViewSlotProps {
    /** Props for each `row` slot, the visible line of a node. */
    row?: SlotPropsValue<TreeViewOwnerState, "div">;
}

export interface TreeViewProps extends Omit<HTMLAttributes<HTMLUListElement>, "className" | "children" | "onSelect"> {
    /** The root nodes. */
    nodes: TreeNode[];
    /** The accessible name of the tree. */
    "aria-label": string;
    /** The ids of the expanded nodes. */
    expandedIds: string[];
    /** Called with the new expanded ids when a node is expanded or collapsed. */
    onExpandedChange: (ids: string[]) => void;
    /** The active node, usually the one shown in the detail panel. */
    selectedId?: string;
    /** Called when a node is clicked, or Enter is pressed on it. */
    onSelect?: (id: string) => void;
    /**
     * Called on Enter or a double-click on a node, after `onSelect`; usually opens the edit view. A single click only selects. A double-click
     * on the expand toggle, the checkbox or the actions doesn't open.
     */
    onOpen?: (id: string) => void;
    /**
     * Shows checkboxes to mark several nodes, e.g. for bulk actions. Space toggles the focused node, Shift+Arrow extends the marking.
     *
     * @defaultValue `false`
     */
    checkable?: boolean;
    /**
     * The ids of the marked nodes.
     *
     * @defaultValue `[]`
     */
    checkedIds?: string[];
    /** Called with the new marked ids. */
    onCheckedChange?: (ids: string[]) => void;
    /**
     * Shows only the nodes it returns `true` for, plus their ancestors, which are dimmed as context and stay expanded.
     */
    filter?: (node: TreeNode) => boolean;
    /**
     * Lets nodes be moved by dragging, with a drag handle on hover, and by keyboard: Ctrl/⌘+X cuts the focused node, Ctrl/⌘+V
     * moves it inside the focused node as its last child, Shift+Ctrl/⌘+V right after it, Escape cancels.
     *
     * @defaultValue `false`
     */
    draggable?: boolean;
    /** Called when a dragged node is dropped, or a cut node is pasted. */
    onMove?: (move: TreeViewMove) => void;
    /** Whether a dragged or cut node may be moved there; by default anywhere except on itself and its descendants. */
    canDrop?: (move: TreeViewMove) => boolean;
    /** Actions at the end of a row, shown on hover, focus, and on the active node. */
    renderActions?: (node: TreeNode) => ReactNode;
    /** Texts for translation; missing keys fall back to `defaultTreeViewLabels`. */
    labels?: Partial<TreeViewLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TreeViewSlotProps;
}

interface VisibleNode {
    node: TreeNode;
    parentId: string | undefined;
    level: number;
    hasChildren: boolean;
    expanded: boolean;
}

const typeIcons = { page: "file", link: "link", folder: "folder" } as const;

function collectParents(nodes: TreeNode[], parentId: string | undefined, parents: Map<string, string | undefined>) {
    for (const node of nodes) {
        parents.set(node.id, parentId);
        if (node.children != null) {
            collectParents(node.children, node.id, parents);
        }
    }
    return parents;
}

function isDescendantOrSelf(parents: Map<string, string | undefined>, id: string, ancestorId: string) {
    let current: string | undefined = id;
    while (current != null) {
        if (current === ancestorId) {
            return true;
        }
        current = parents.get(current);
    }
    return false;
}

/** Returns the ids of the nodes matching `filter` and of their ancestors. */
function collectIncluded(nodes: TreeNode[], filter: (node: TreeNode) => boolean, included: Set<string>, matching: Set<string>) {
    let anyIncluded = false;
    for (const node of nodes) {
        const childIncluded = node.children != null && collectIncluded(node.children, filter, included, matching);
        const matches = filter(node);
        if (matches) {
            matching.add(node.id);
        }
        if (matches || childIncluded) {
            included.add(node.id);
            anyIncluded = true;
        }
    }
    return anyIncluded;
}

function getDropPosition(event: DragEvent<HTMLElement>, allowInside: boolean): TreeViewMove["position"] {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = (event.clientY - rect.top) / rect.height;
    if (!allowInside) {
        return offset < 0.5 ? "before" : "after";
    }
    return offset < 0.25 ? "before" : offset > 0.75 ? "after" : "inside";
}

function stopPropagation(event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
}

function isWithinRowControl(target: EventTarget) {
    return target instanceof Element && target.closest(`.${styles.toggle}, .${styles.checkbox}, .${styles.actions}`) != null;
}

const focusableSelector = "a[href], button, input, select, textarea, [tabindex]";
const savedTabIndexAttribute = "data-dextinity-tree-view-tabindex";

/** Keeps the actions of rows other than the tab stop out of the Tab order, so the tree stays a single tab stop with its actions. */
function updateActionsTabOrder(actions: HTMLElement, isTabStop: boolean) {
    for (const element of actions.querySelectorAll<HTMLElement>(focusableSelector)) {
        const savedTabIndex = element.getAttribute(savedTabIndexAttribute);
        if (isTabStop) {
            if (savedTabIndex != null) {
                if (savedTabIndex === "") {
                    element.removeAttribute("tabindex");
                } else {
                    element.setAttribute("tabindex", savedTabIndex);
                }
                element.removeAttribute(savedTabIndexAttribute);
            }
        } else if (savedTabIndex == null) {
            element.setAttribute(savedTabIndexAttribute, element.getAttribute("tabindex") ?? "");
            element.setAttribute("tabindex", "-1");
        }
    }
}

/**
 * A hierarchy such as the page tree: expand, select, mark several nodes, and move them by dragging. Follows the WAI-ARIA tree
 * pattern for keyboard use.
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
    {
        nodes,
        "aria-label": ariaLabel,
        expandedIds,
        onExpandedChange,
        selectedId,
        onSelect,
        onOpen,
        checkable = false,
        checkedIds = [],
        onCheckedChange,
        filter,
        draggable = false,
        onMove,
        canDrop,
        renderActions,
        labels: labelsProp,
        className,
        slotProps,
        onKeyDown,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultTreeViewLabels, ...labelsProp };
    const ownerState: TreeViewOwnerState = { checkable, draggable, filtered: filter != null };
    const baseId = useId();
    const rootRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLUListElement);
    const itemRefs = useRef(new Map<string, HTMLLIElement>());
    const [focusedId, setFocusedId] = useState<string>();
    const [draggedId, setDraggedId] = useState<string>();
    const [dropTarget, setDropTarget] = useState<Omit<TreeViewMove, "id">>();
    const [cutId, setCutId] = useState<string>();
    const labelRefs = useRef(new Map<string, HTMLSpanElement>());
    const [fullLabelId, setFullLabelId] = useState<string>();
    const fullLabelTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const expanded = new Set(expandedIds);
    const checked = new Set(checkedIds);
    const included = new Set<string>();
    const matching = new Set<string>();
    if (filter != null) {
        collectIncluded(nodes, filter, included, matching);
    }
    const parents = collectParents(nodes, undefined, new Map());

    const visibleNodes: VisibleNode[] = [];
    const collectVisible = (levelNodes: TreeNode[], parentId: string | undefined, level: number) => {
        for (const node of levelNodes) {
            if (filter != null && !included.has(node.id)) {
                continue;
            }
            const children = node.children?.filter((child) => filter == null || included.has(child.id)) ?? [];
            const isExpanded = children.length > 0 && (expanded.has(node.id) || (filter != null && !matching.has(node.id)));
            visibleNodes.push({ node, parentId, level, hasChildren: children.length > 0, expanded: isExpanded });
            if (isExpanded) {
                collectVisible(children, node.id, level + 1);
            }
        }
    };
    collectVisible(nodes, undefined, 1);

    const visibleById = new Map(visibleNodes.map((visibleNode) => [visibleNode.node.id, visibleNode]));
    const visibleIds = visibleNodes.map((visibleNode) => visibleNode.node.id);
    const tabStopId =
        focusedId != null && visibleIds.includes(focusedId)
            ? focusedId
            : selectedId != null && visibleIds.includes(selectedId)
              ? selectedId
              : visibleIds[0];

    useEffect(() => {
        for (const actions of rootRef.current?.querySelectorAll<HTMLElement>("[data-actions-for]") ?? []) {
            updateActionsTabOrder(actions, actions.dataset.actionsFor === tabStopId);
        }
    });

    useEffect(() => () => clearTimeout(fullLabelTimeout.current), []);

    const isLabelTruncated = (id: string) => {
        const label = labelRefs.current.get(id);
        return label != null && label.scrollWidth > label.clientWidth;
    };
    const showFullLabel = (id: string, delay = 0) => {
        clearTimeout(fullLabelTimeout.current);
        if (!isLabelTruncated(id)) {
            setFullLabelId(undefined);
            return;
        }
        if (delay === 0) {
            setFullLabelId(id);
        } else {
            fullLabelTimeout.current = setTimeout(() => setFullLabelId(id), delay);
        }
    };
    const hideFullLabel = (id?: string) => {
        clearTimeout(fullLabelTimeout.current);
        setFullLabelId((previous) => (id == null || previous === id ? undefined : previous));
    };

    const focusNode = (id: string) => {
        setFocusedId(id);
        itemRefs.current.get(id)?.focus();
    };
    const setExpanded = (id: string, isExpanded: boolean) => {
        onExpandedChange(isExpanded ? [...expandedIds, id] : expandedIds.filter((expandedId) => expandedId !== id));
    };
    const setChecked = (ids: string[], isChecked: boolean) => {
        const changed = new Set(ids);
        const others = checkedIds.filter((checkedId) => !changed.has(checkedId));
        onCheckedChange?.(isChecked ? [...others, ...ids] : others);
    };

    const isDropAllowed = (move: TreeViewMove) => !isDescendantOrSelf(parents, move.targetId, move.id) && (canDrop == null || canDrop(move));

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        onKeyDown?.(event);
        const target = event.target as HTMLElement;
        if (event.defaultPrevented || target.getAttribute("role") !== "treeitem") {
            return;
        }
        const id = target.dataset.id;
        const index = visibleNodes.findIndex((visibleNode) => visibleNode.node.id === id);
        if (id == null || index === -1) {
            return;
        }
        const current = visibleNodes[index];
        const moveTo = (nextIndex: number) => {
            const next = visibleNodes[Math.max(0, Math.min(visibleNodes.length - 1, nextIndex))];
            if (event.shiftKey && checkable) {
                setChecked([id, next.node.id], true);
            }
            focusNode(next.node.id);
        };

        if (draggable && (event.ctrlKey || event.metaKey) && !event.altKey) {
            const key = event.key.toLowerCase();
            if (key === "x") {
                event.preventDefault();
                setCutId(id);
                return;
            }
            if (key === "v" && cutId != null) {
                event.preventDefault();
                const move: TreeViewMove = { id: cutId, targetId: id, position: event.shiftKey ? "after" : "inside" };
                if (isDropAllowed(move)) {
                    onMove?.(move);
                    setCutId(undefined);
                }
                return;
            }
        }

        let handled = true;
        switch (event.key) {
            case "ArrowDown":
                moveTo(index + 1);
                break;
            case "ArrowUp":
                moveTo(index - 1);
                break;
            case "Home":
                moveTo(0);
                break;
            case "End":
                moveTo(visibleNodes.length - 1);
                break;
            case "ArrowRight":
                if (current.hasChildren && !current.expanded) {
                    setExpanded(id, true);
                } else if (current.expanded) {
                    moveTo(index + 1);
                }
                break;
            case "ArrowLeft":
                if (current.expanded && (filter == null || matching.has(id))) {
                    setExpanded(id, false);
                } else if (current.parentId != null) {
                    focusNode(current.parentId);
                }
                break;
            case "Enter":
                onSelect?.(id);
                onOpen?.(id);
                break;
            case " ":
                if (checkable) {
                    setChecked([id], !checked.has(id));
                } else {
                    onSelect?.(id);
                }
                break;
            case "Escape":
                hideFullLabel();
                if (cutId != null) {
                    setCutId(undefined);
                } else if (fullLabelId == null) {
                    handled = false;
                }
                if (handled) {
                    // Escape only ends the cut or hides the full name; it must not also close a dialog the tree sits in
                    event.stopPropagation();
                }
                break;
            case "*": {
                const siblingIds = visibleNodes
                    .filter((visibleNode) => visibleNode.parentId === current.parentId && visibleNode.hasChildren && !visibleNode.expanded)
                    .map((visibleNode) => visibleNode.node.id);
                onExpandedChange([...expandedIds, ...siblingIds]);
                break;
            }
            default:
                handled = false;
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    const character = event.key.toLowerCase();
                    const ordered = [...visibleNodes.slice(index + 1), ...visibleNodes.slice(0, index)];
                    const match = ordered.find((visibleNode) => visibleNode.node.label.toLowerCase().startsWith(character));
                    if (match != null) {
                        focusNode(match.node.id);
                        handled = true;
                    }
                }
        }
        if (handled) {
            event.preventDefault();
        }
    };

    const renderNodes = (levelNodes: TreeNode[], level: number): ReactNode =>
        levelNodes.map((node) => {
            const visibleNode = visibleById.get(node.id);
            if (visibleNode == null) {
                return null;
            }
            const { hasChildren, expanded: isExpanded } = visibleNode;
            const isSelected = node.id === selectedId;
            const isChecked = checked.has(node.id);
            const isContext = filter != null && !matching.has(node.id);
            const drop = dropTarget?.targetId === node.id ? dropTarget.position : undefined;
            const childNodes = isExpanded ? node.children : undefined;
            const partId = (part: string) => `${baseId}-${encodeURIComponent(node.id)}-${part}`;

            const rowProps = resolveSlotProps<TreeViewOwnerState, "div", "div">({
                ownProps: {
                    className: styles.row,
                    style: { "--dextinity-tree-view-node-level": level - 1 } as CSSProperties,
                    draggable: draggable || undefined,
                    onClick: () => {
                        focusNode(node.id);
                        onSelect?.(node.id);
                    },
                    onDoubleClick: onOpen
                        ? (event: MouseEvent<HTMLDivElement>) => {
                              if (!isWithinRowControl(event.target)) {
                                  onOpen(node.id);
                              }
                          }
                        : undefined,
                    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
                        if (event.pointerType === "mouse") {
                            showFullLabel(node.id, readTooltipDelay(event.currentTarget));
                        }
                    },
                    onPointerLeave: () => hideFullLabel(node.id),
                    onDragStart: draggable
                        ? (event: DragEvent<HTMLDivElement>) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", node.id);
                              setDraggedId(node.id);
                          }
                        : undefined,
                    onDragOver: draggable
                        ? (event: DragEvent<HTMLDivElement>) => {
                              if (draggedId == null) {
                                  return;
                              }
                              const position = getDropPosition(event, true);
                              const move = { id: draggedId, targetId: node.id, position };
                              if (!isDropAllowed(move)) {
                                  setDropTarget(undefined);
                                  return;
                              }
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "move";
                              if (dropTarget?.targetId !== node.id || dropTarget.position !== position) {
                                  setDropTarget({ targetId: node.id, position });
                              }
                          }
                        : undefined,
                    onDragLeave: draggable
                        ? (event: DragEvent<HTMLDivElement>) => {
                              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                  setDropTarget((previous) => (previous?.targetId === node.id ? undefined : previous));
                              }
                          }
                        : undefined,
                    onDrop: draggable
                        ? (event: DragEvent<HTMLDivElement>) => {
                              event.preventDefault();
                              if (draggedId != null && dropTarget != null) {
                                  onMove?.({ id: draggedId, ...dropTarget });
                              }
                              setDraggedId(undefined);
                              setDropTarget(undefined);
                          }
                        : undefined,
                    onDragEnd: draggable
                        ? () => {
                              setDraggedId(undefined);
                              setDropTarget(undefined);
                          }
                        : undefined,
                },
                slotProps: slotProps?.row,
                ownerState,
            });

            const label = (
                <span
                    ref={(element) => {
                        if (element != null) {
                            labelRefs.current.set(node.id, element);
                        } else {
                            labelRefs.current.delete(node.id);
                        }
                    }}
                    id={partId("label")}
                    className={styles.label}
                >
                    {node.label}
                </span>
            );

            return (
                <li
                    key={node.id}
                    ref={(element) => {
                        if (element != null) {
                            itemRefs.current.set(node.id, element);
                        } else {
                            itemRefs.current.delete(node.id);
                        }
                    }}
                    role="treeitem"
                    className={styles.item}
                    style={{ "--dextinity-tree-view-node-level": level - 1 } as CSSProperties}
                    data-id={node.id}
                    data-drop={drop === "before" || drop === "after" ? drop : undefined}
                    aria-labelledby={node.hiddenInMenu ? `${partId("label")} ${partId("hidden")}` : partId("label")}
                    aria-describedby={node.status != null ? partId("status") : undefined}
                    aria-level={level}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-selected={isSelected}
                    aria-checked={checkable ? isChecked : undefined}
                    tabIndex={node.id === tabStopId ? 0 : -1}
                    onFocus={(event) => {
                        if (event.target === event.currentTarget) {
                            setFocusedId(node.id);
                            if (event.currentTarget.matches(":focus-visible")) {
                                showFullLabel(node.id);
                            }
                        }
                    }}
                    onBlur={(event) => {
                        if (event.target === event.currentTarget) {
                            hideFullLabel(node.id);
                        }
                    }}
                >
                    <div
                        {...rowProps}
                        data-selected={isSelected ? "" : undefined}
                        data-checked={isChecked ? "" : undefined}
                        data-context={isContext ? "" : undefined}
                        data-dragging={draggedId === node.id ? "" : undefined}
                        data-cut={cutId === node.id ? "" : undefined}
                        data-drop={drop}
                    >
                        {draggable && (
                            <span className={styles.dragHandle} aria-hidden>
                                <Icon name="drag-indicator" />
                            </span>
                        )}
                        <span
                            className={styles.toggle}
                            data-hidden={hasChildren ? undefined : ""}
                            aria-hidden
                            onClick={(event) => {
                                event.stopPropagation();
                                focusNode(node.id);
                                if (hasChildren) {
                                    setExpanded(node.id, !isExpanded);
                                }
                            }}
                        >
                            <Icon name="chevron-right" />
                        </span>
                        {checkable && (
                            <span className={styles.checkbox} aria-hidden onClick={stopPropagation} onMouseDown={(event) => event.preventDefault()}>
                                <Checkbox
                                    checked={isChecked}
                                    onChange={(nextChecked) => {
                                        setChecked([node.id], nextChecked);
                                        focusNode(node.id);
                                    }}
                                    slotProps={{ control: { tabIndex: -1 } }}
                                />
                            </span>
                        )}
                        <span className={styles.icon} aria-hidden>
                            {node.icon ?? <Icon name={typeIcons[node.type ?? "page"]} />}
                        </span>
                        {fullLabelId === node.id ? (
                            <Tooltip
                                content={node.label}
                                placement="right"
                                open
                                onOpenChange={(open) => !open && hideFullLabel(node.id)}
                                slotProps={{ positioner: { anchor: () => labelRefs.current.get(node.id)?.parentElement ?? null } }}
                            >
                                {label}
                            </Tooltip>
                        ) : (
                            label
                        )}
                        {node.hiddenInMenu && (
                            <span id={partId("hidden")} className={styles.hiddenInMenu} role="img" aria-label={labels.hiddenInMenu}>
                                <Icon name="invisible" />
                            </span>
                        )}
                        <span className={styles.path} aria-hidden>
                            {node.path}
                        </span>
                        {renderActions != null && (
                            <span className={styles.actions} data-actions-for={node.id} onClick={stopPropagation} onKeyDown={stopPropagation}>
                                {renderActions(node)}
                            </span>
                        )}
                        {node.status != null && <StatusIndicator id={partId("status")} className={styles.status} status={node.status} dotOnly />}
                    </div>
                    {childNodes != null && (
                        <ul role="group" className={styles.group}>
                            {renderNodes(childNodes, level + 1)}
                        </ul>
                    )}
                </li>
            );
        });

    return (
        <ul
            {...restProps}
            ref={rootRef}
            role="tree"
            aria-label={ariaLabel}
            data-checkable={ownerState.checkable ? "" : undefined}
            data-draggable={ownerState.draggable ? "" : undefined}
            data-filtered={ownerState.filtered ? "" : undefined}
            className={clsx(styles.root, className)}
            onKeyDown={handleKeyDown}
        >
            {renderNodes(nodes, 1)}
        </ul>
    );
});
