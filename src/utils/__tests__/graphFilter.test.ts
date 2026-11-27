import type { GraphEdge, GraphNode } from "../../types/graph.ts";
import { computeGraphHighlight } from "../graphFilter.ts";

const assertEqual = <T>(actual: T, expected: T, message: string): void => {
  if (actual !== expected) {
    throw new Error(`${message} — expected ${String(expected)}, got ${String(actual)}`);
  }
}

const mockNodes: GraphNode[] = [
  { id: "repo:alpha", type: "repo", label: "alpha", color: "#fff", degree: 2 },
  { id: "repo:beta", type: "repo", label: "beta", color: "#fff", degree: 1 },
  { id: "tech:TypeScript", type: "tech", label: "TypeScript", color: "#38bdf8", degree: 2 },
  { id: "tech:Docker", type: "tech", label: "Docker", color: "#0ea5e9", degree: 1 },
];

const mockEdges: GraphEdge[] = [
  { source: "repo:alpha", target: "tech:TypeScript", weight: 1, kind: "language" },
  { source: "repo:alpha", target: "tech:Docker", weight: 0.85, kind: "tech" },
  { source: "repo:beta", target: "tech:TypeScript", weight: 1, kind: "language" },
];

// 1. Empty selection
{
  const res = computeGraphHighlight(mockNodes, mockEdges, [], null, "AND");
  assertEqual(res.hasActiveSelection, false, "empty selection should be inactive");
  assertEqual(res.intersectionRepoIds.size, 0, "empty selection should have 0 intersections");
}

// 2. Multi-node strict intersection (AND)
{
  const res = computeGraphHighlight(
    mockNodes,
    mockEdges,
    ["tech:TypeScript", "tech:Docker"],
    null,
    "AND"
  );
  assertEqual(res.hasActiveSelection, true, "AND selection should be active");
  assertEqual(res.intersectionRepoIds.has("repo:alpha"), true, "alpha connects both");
  assertEqual(res.intersectionRepoIds.has("repo:beta"), false, "beta connects only one");
  assertEqual(res.partialRepoIds.has("repo:beta"), true, "beta is partial match");
  assertEqual(res.activeNodeIds.has("repo:beta"), false, "beta hidden in AND mode");
}

// 3. Multi-node union (OR)
{
  const res = computeGraphHighlight(
    mockNodes,
    mockEdges,
    ["tech:TypeScript", "tech:Docker"],
    null,
    "OR"
  );
  assertEqual(res.intersectionRepoIds.has("repo:alpha"), true, "alpha is bridge");
  assertEqual(res.activeNodeIds.has("repo:beta"), true, "beta visible in OR mode");
}

// 4. Focused single repository
{
  const res = computeGraphHighlight(mockNodes, mockEdges, [], "repo:alpha", "AND");
  assertEqual(res.hasActiveSelection, true, "focused repo should activate highlight");
  assertEqual(res.activeNodeIds.has("tech:TypeScript"), true, "TypeScript connected to alpha");
  assertEqual(res.activeNodeIds.has("tech:Docker"), true, "Docker connected to alpha");
  assertEqual(res.activeNodeIds.has("repo:beta"), false, "beta unrelated to focused alpha");
}

console.log("✔ graphFilter.test.ts: 4/4 suites passed");
