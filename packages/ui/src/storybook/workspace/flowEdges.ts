import type { FlowEdgeKind } from "../pageTypes/prototypeNavigation";
import { getOriginalId } from "../scenario";
import { createStoredList } from "./workspaceNotes";

/** A way from one page of a prototype to another, found on the page or taken by the designer. */
export interface FlowEdge {
    prototypeId: string;
    from: string;
    to: string;
    kind: FlowEdgeKind;
}

export const flowEdgeList = createStoredList<FlowEdge>("dextinity-ui-workspace-flow-edges");

// An extra entry of the many scenario opens its original's page, which is the page on the map
export function addFlowEdges(foundEdges: FlowEdge[]) {
    const edges = foundEdges.map((edge) => ({ ...edge, from: getOriginalId(edge.from), to: getOriginalId(edge.to) }));
    const known = new Set(flowEdgeList.get().map(edgeKey));
    const added = edges.filter((edge) => edge.from !== edge.to && !known.has(edgeKey(edge)) && known.add(edgeKey(edge)));
    if (added.length > 0) {
        flowEdgeList.update((items) => [...items, ...added]);
    }
}

function edgeKey(edge: FlowEdge) {
    return `${edge.prototypeId}|${edge.from}|${edge.to}|${edge.kind}`;
}
