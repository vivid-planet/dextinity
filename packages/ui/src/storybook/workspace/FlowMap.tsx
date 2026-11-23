import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../components/button/Button";
import { Icon } from "../../components/icon/Icon";
import { addFlowEdges, type FlowEdge, flowEdgeList } from "./flowEdges";
import styles from "./FlowMap.module.scss";

const nodeWidth = 200;
const nodeHeight = 48;
const columnGap = 96;
const rowGap = 14;
const padding = 24;
const scanDelay = 700;
// Each prototype is scanned once per visit of the workspace on opening the map; its pages rarely change in between
const scannedPrototypes = new Set<string>();

interface FlowNode {
    id: string;
    label: string;
    column: number;
    row: number;
    inNavigation: boolean;
    designed: boolean;
    deadEnd: boolean;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function readLinks(frameDocument: Document) {
    const links = Array.from(frameDocument.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const toPage = (link: HTMLAnchorElement) => decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
    return {
        content: links
            .filter((link) => !link.closest("nav"))
            .map(toPage)
            .filter(Boolean),
        navigation: links
            .filter((link) => link.closest("nav"))
            .map(toPage)
            .filter(Boolean),
    };
}

/** Columns by the number of steps from the start page: links first, the app's navigation where no link leads. */
function layOut(pageIds: string[], startPageId: string, links: Map<string, Set<string>>, navigationIds: Set<string>) {
    const depth = new Map<string, number>();
    function walk(roots: string[], startDepth: number) {
        let current = roots.filter((id) => !depth.has(id));
        current.forEach((id) => depth.set(id, startDepth));
        let level = startDepth;
        while (current.length > 0) {
            level++;
            const next: string[] = [];
            for (const id of current) {
                for (const target of links.get(id) ?? []) {
                    if (!depth.has(target)) {
                        depth.set(target, level);
                        next.push(target);
                    }
                }
            }
            current = next;
        }
    }
    walk([startPageId], 0);
    walk([...navigationIds], 1);
    const lastColumn = Math.max(0, ...depth.values()) + 1;
    return pageIds.map((id) => ({ id, column: depth.get(id) ?? lastColumn }));
}

/**
 * All pages of a prototype as a map of the ways between them: the links found on its pages, and the ones the designer took while
 * clicking through it. Shows pages no link leads to, links to pages without a design, and pages without a way on.
 */
export function FlowMap({
    prototypeId,
    storyUrl,
    startPageId,
    pageIds,
    getPageLabel,
    onOpenPage,
}: {
    prototypeId: string;
    storyUrl: string;
    startPageId: string;
    /** The pages with a design, including the ones the designer added. */
    pageIds: string[];
    getPageLabel: (pageId: string) => string;
    onOpenPage: (pageId: string) => void;
}) {
    const edges = flowEdgeList.useItems().filter((edge) => edge.prototypeId === prototypeId);
    const [scan, setScan] = useState<{ done: number; total: number } | null>(null);
    const [navigationIds, setNavigationIds] = useState<string[]>([]);
    const scanFrameRef = useRef<HTMLIFrameElement>(null);
    const scanStarted = useRef(false);

    async function scanPages() {
        const frameWindow = scanFrameRef.current?.contentWindow;
        if (!frameWindow || scanStarted.current) {
            return;
        }
        scanStarted.current = true;
        const found: FlowEdge[] = [];
        const navigation = new Set<string>();
        for (const [index, pageId] of pageIds.entries()) {
            setScan({ done: index, total: pageIds.length });
            frameWindow.location.hash = pageId;
            await wait(scanDelay);
            const links = readLinks(frameWindow.document);
            links.content.forEach((to) => found.push({ prototypeId, from: pageId, to, kind: "link" }));
            links.navigation.forEach((id) => navigation.add(id));
        }
        addFlowEdges(found);
        scannedPrototypes.add(prototypeId);
        setNavigationIds([...navigation]);
        setScan(null);
        scanStarted.current = false;
    }

    const { nodes, lines, width, height } = useMemo(() => {
        const links = new Map<string, Set<string>>();
        for (const edge of edges.filter((candidate) => candidate.kind === "link")) {
            links.set(edge.from, (links.get(edge.from) ?? new Set()).add(edge.to));
        }
        const navigation = new Set([...navigationIds, ...edges.filter((edge) => edge.kind === "navigation").map((edge) => edge.to)]);
        const allIds = [...new Set([...pageIds, ...[...links.values()].flatMap((targets) => [...targets])])];
        const placed = layOut(allIds, startPageId, links, navigation);
        const rows = new Map<number, number>();
        const flowNodes: FlowNode[] = placed
            .sort((a, b) => a.column - b.column || getPageLabel(a.id).localeCompare(getPageLabel(b.id)))
            .map(({ id, column }) => {
                const row = rows.get(column) ?? 0;
                rows.set(column, row + 1);
                const designed = pageIds.includes(id);
                return { id, label: getPageLabel(id), column, row, inNavigation: navigation.has(id), designed, deadEnd: designed && !links.has(id) };
            });
        const position = new Map(
            flowNodes.map((node) => [node.id, { x: padding + node.column * (nodeWidth + columnGap), y: padding + node.row * (nodeHeight + rowGap) }]),
        );
        const flowLines = [...links.entries()].flatMap(([from, targets]) =>
            [...targets].map((to) => {
                const start = position.get(from);
                const end = position.get(to);
                if (!start || !end) {
                    return null;
                }
                const x1 = start.x + nodeWidth;
                const y1 = start.y + nodeHeight / 2;
                const x2 = end.x;
                const y2 = end.y + nodeHeight / 2;
                const bend = Math.max(48, Math.abs(x2 - x1) / 2);
                return { key: `${from}->${to}`, backwards: x2 <= x1, path: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}` };
            }),
        );
        const columns = Math.max(0, ...flowNodes.map((node) => node.column)) + 1;
        const maxRows = Math.max(1, ...rows.values());
        return {
            nodes: flowNodes,
            lines: flowLines.filter((line) => line != null),
            width: padding * 2 + columns * nodeWidth + (columns - 1) * columnGap,
            height: padding * 2 + maxRows * nodeHeight + (maxRows - 1) * rowGap,
        };
    }, [edges, navigationIds, pageIds, startPageId, getPageLabel]);

    useEffect(() => {
        if (!scannedPrototypes.has(prototypeId)) {
            const frame = scanFrameRef.current;
            const start = () => void scanPages();
            frame?.addEventListener("load", start, { once: true });
            return () => frame?.removeEventListener("load", start);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only on opening
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.bar}>
                <p className={styles.summary}>
                    {nodes.length} pages · {lines.length} links · {nodes.filter((node) => node.deadEnd).length} without a way on
                </p>
                <ul className={styles.legend}>
                    <li data-tag="navigation">In the navigation</li>
                    <li data-tag="undesigned">No design yet</li>
                    <li data-tag="deadEnd">No link on</li>
                </ul>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Icon name="refresh" />}
                    disabled={scan != null}
                    onClick={() => void scanPages()}
                >
                    {scan ? `Scanning ${scan.done + 1} of ${scan.total}` : "Scan pages"}
                </Button>
                <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={() => flowEdgeList.update((items) => items.filter((edge) => edge.prototypeId !== prototypeId))}
                >
                    Forget links
                </Button>
            </div>
            <div className={styles.canvas}>
                <div className={styles.map} style={{ width, height }}>
                    <svg className={styles.lines} width={width} height={height} aria-hidden>
                        <defs>
                            <marker id="flow-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                                <path d="M 0 0 L 8 4 L 0 8 z" />
                            </marker>
                        </defs>
                        {lines.map((line) => (
                            <path key={line.key} d={line.path} data-backwards={line.backwards || undefined} markerEnd="url(#flow-arrow)" />
                        ))}
                    </svg>
                    {nodes.map((node) => (
                        <button
                            key={node.id}
                            type="button"
                            className={styles.node}
                            data-undesigned={!node.designed || undefined}
                            data-dead-end={node.deadEnd || undefined}
                            style={{
                                left: padding + node.column * (nodeWidth + columnGap),
                                top: padding + node.row * (nodeHeight + rowGap),
                                width: nodeWidth,
                                height: nodeHeight,
                            }}
                            onClick={() => onOpenPage(node.id)}
                        >
                            <span className={styles.nodeLabel}>{node.label}</span>
                            <span className={styles.tags}>
                                {node.inNavigation && <span data-tag="navigation">Nav</span>}
                                {!node.designed && <span data-tag="undesigned">No design</span>}
                                {node.deadEnd && <span data-tag="deadEnd">No link on</span>}
                            </span>
                        </button>
                    ))}
                </div>
                {edges.length === 0 && scan == null && (
                    <p className={styles.hint}>Click through the prototype or scan its pages to see the ways between them.</p>
                )}
            </div>
            <iframe ref={scanFrameRef} className={styles.scanFrame} src={storyUrl} title="Scanning the prototype's pages" tabIndex={-1} aria-hidden />
        </div>
    );
}
