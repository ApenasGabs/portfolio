import type { GraphEdge, GraphNode } from "../types/graph";

export type FilterMatchMode = "AND" | "OR";

export interface GraphHighlightState {
  hasActiveSelection: boolean;
  intersectionRepoIds: Set<string>;
  partialRepoIds: Set<string>;
  activeNodeIds: Set<string>;
  activeEdgeKeys: Set<string>;
  bridgeEdgeKeys: Set<string>;
}

export const computeGraphHighlight = (
  _nodes: GraphNode[],
  edges: GraphEdge[],
  selectedFilterIds: string[],
  focusedRepoId: string | null,
  matchMode: FilterMatchMode
): GraphHighlightState => {
  const intersectionRepoIds = new Set<string>();
  const partialRepoIds = new Set<string>();
  const activeNodeIds = new Set<string>();
  const activeEdgeKeys = new Set<string>();
  const bridgeEdgeKeys = new Set<string>();

  // Build adjacency repoId -> Set<targetId>
  const repoToTargets = new Map<string, Set<string>>();
  for (const e of edges) {
    const repoId = e.source.startsWith("repo:") ? e.source : e.target;
    const otherId = e.source.startsWith("repo:") ? e.target : e.source;
    if (!repoToTargets.has(repoId)) repoToTargets.set(repoId, new Set());
    repoToTargets.get(repoId)!.add(otherId);
  }

  // Case 1: User focused a specific repository node
  if (focusedRepoId && selectedFilterIds.length === 0) {
    activeNodeIds.add(focusedRepoId);
    intersectionRepoIds.add(focusedRepoId);
    for (const e of edges) {
      if (e.source === focusedRepoId || e.target === focusedRepoId) {
        const key = `${e.source}->${e.target}`;
        activeEdgeKeys.add(key);
        bridgeEdgeKeys.add(key);
        activeNodeIds.add(e.source);
        activeNodeIds.add(e.target);
      }
    }
    return {
      hasActiveSelection: true,
      intersectionRepoIds,
      partialRepoIds,
      activeNodeIds,
      activeEdgeKeys,
      bridgeEdgeKeys,
    };
  }

  if (selectedFilterIds.length === 0) {
    return {
      hasActiveSelection: false,
      intersectionRepoIds,
      partialRepoIds,
      activeNodeIds,
      activeEdgeKeys,
      bridgeEdgeKeys,
    };
  }

  const selectedSet = new Set(selectedFilterIds);
  for (const id of selectedFilterIds) activeNodeIds.add(id);

  for (const [repoId, targets] of repoToTargets.entries()) {
    let matchedCount = 0;
    for (const sel of selectedFilterIds) {
      if (targets.has(sel)) matchedCount++;
    }
    if (matchedCount === selectedFilterIds.length) {
      intersectionRepoIds.add(repoId);
      activeNodeIds.add(repoId);
    } else if (matchedCount > 0) {
      partialRepoIds.add(repoId);
      if (matchMode === "OR") {
        activeNodeIds.add(repoId);
      }
    }
  }

  if (focusedRepoId) {
    activeNodeIds.add(focusedRepoId);
  }

  for (const e of edges) {
    const repoId = e.source.startsWith("repo:") ? e.source : e.target;
    const hubId = e.source.startsWith("repo:") ? e.target : e.source;
    const key = `${e.source}->${e.target}`;

    if (selectedSet.has(hubId)) {
      if (intersectionRepoIds.has(repoId)) {
        activeEdgeKeys.add(key);
        bridgeEdgeKeys.add(key);
      } else if (matchMode === "OR" && partialRepoIds.has(repoId)) {
        activeEdgeKeys.add(key);
      }
    }

    if (focusedRepoId && repoId === focusedRepoId) {
      activeEdgeKeys.add(key);
      activeNodeIds.add(hubId);
    }
  }

  return {
    hasActiveSelection: true,
    intersectionRepoIds,
    partialRepoIds,
    activeNodeIds,
    activeEdgeKeys,
    bridgeEdgeKeys,
  };
}
