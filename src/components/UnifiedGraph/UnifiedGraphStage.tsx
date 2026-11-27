import type { ReactElement } from "react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import type { GraphEdge, GraphNode } from "../../types/graph";
import { computeGraphHighlight, type FilterMatchMode } from "../../utils/graphFilter";

import Canvas2D from "./Canvas2D";

const Canvas3D = lazy(() => import("./Canvas3D"));

export type GraphDimension = "3d" | "2d";
export type StageSizeMode = "auto" | "minimized" | "expanded";

interface UnifiedGraphStageProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedFilterIds: string[];
  focusedRepoId: string | null;
  matchMode: FilterMatchMode;
  stageMode: StageSizeMode;
  onStageModeChange: (mode: StageSizeMode) => void;
  onToggleFilterNode: (nodeId: string) => void;
  onFocusRepoNode: (repoId: string | null) => void;
  onClearFilters: () => void;
}

const SCROLL_COLLAPSE_PX = 250;

const UnifiedGraphStage = ({
  nodes,
  edges,
  selectedFilterIds,
  focusedRepoId,
  matchMode,
  stageMode,
  onStageModeChange,
  onToggleFilterNode,
  onFocusRepoNode,
  onClearFilters,
}: UnifiedGraphStageProps): ReactElement => {
  const [dimension, setDimension] = useState<GraphDimension>("3d");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [scrollCollapsed, setScrollCollapsed] = useState(false);

  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const canvasOpacityRef = useRef<HTMLDivElement | null>(null);

  const highlight = useMemo(
    () => computeGraphHighlight(nodes, edges, selectedFilterIds, focusedRepoId, matchMode),
    [nodes, edges, selectedFilterIds, focusedRepoId, matchMode]
  );

  // Smooth 60fps scroll-driven shrink without React re-renders per pixel!
  useEffect(() => {
    if (stageMode !== "auto") {
      setScrollCollapsed(false);
      if (stageCardRef.current) {
        stageCardRef.current.style.height = "";
        stageCardRef.current.style.transform = "";
      }
      if (canvasOpacityRef.current) {
        canvasOpacityRef.current.style.opacity = "1";
      }
      return;
    }

    let raf = 0;
    const updateOnScroll = () => {
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / SCROLL_COLLAPSE_PX));
      const baseH = window.innerWidth < 640 ? 370 : 440;
      const minH = 56;
      const currentH = Math.round(baseH - (baseH - minH) * p);

      if (stageCardRef.current) {
        stageCardRef.current.style.height = `${currentH}px`;
      }
      if (canvasOpacityRef.current) {
        const canvasAlpha = Math.max(0, 1 - p * 1.35);
        canvasOpacityRef.current.style.opacity = canvasAlpha.toFixed(3);
        canvasOpacityRef.current.style.pointerEvents = p > 0.72 ? "none" : "auto";
      }
      setScrollCollapsed((prev) => {
        const next = p >= 0.85;
        return prev === next ? prev : next;
      });
    };

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(updateOnScroll);
    };

    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stageMode]);

  const focusedNode = useMemo(
    () => (focusedRepoId ? nodes.find((n) => n.id === focusedRepoId) ?? null : null),
    [focusedRepoId, nodes]
  );

  const selectedNodes = useMemo(
    () =>
      selectedFilterIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is GraphNode => Boolean(n)),
    [selectedFilterIds, nodes]
  );

  const isCompact = stageMode === "minimized" || (stageMode === "auto" && scrollCollapsed);

  const handleRestoreFromCompact = () => {
    if (stageMode === "minimized") {
      onStageModeChange("auto");
    }
    if (window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Outer wrapper holds space cleanly in "auto" mode so scrollY never feedback-jitters!
  const outerHeightClass =
    stageMode === "minimized"
      ? "h-[56px] mb-5"
      : stageMode === "expanded"
        ? "h-[78vh] min-h-[560px] mb-6"
        : "h-[370px] sm:h-[440px] mb-6";

  return (
    <>
      {/* Sticky HUD pill that stays visible below Navbar once scrolled past the hero! */}
      {stageMode === "auto" && scrollCollapsed && (
        <div
          className="sticky top-[70px] z-30 mb-4 glass-panel rounded-2xl px-3.5 h-[52px] flex items-center justify-between gap-3 shadow-xl transition-all"
          data-testid="graph-sticky-hud"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="font-display font-bold text-xs sm:text-sm truncate">
              Grafo ({dimension.toUpperCase()})
            </span>
            {selectedNodes.length > 0 ? (
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {selectedNodes.slice(0, 3).map((n) => (
                  <span
                    key={n.id}
                    className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/40 text-sky-300 whitespace-nowrap"
                  >
                    {n.label}
                  </span>
                ))}
                <span className="font-mono text-[11px] text-amber-300">
                  → {highlight.intersectionRepoIds.size} ponte(s)
                </span>
              </div>
            ) : (
              <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
                recolhido no scroll · {nodes.length} nós
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedNodes.length > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={handleRestoreFromCompact}
              className="px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary hover:text-slate-950 border border-primary/40 text-xs font-semibold text-primary transition-colors"
              data-testid="restore-graph-scroll-btn"
            >
              Ver Grafo ↑
            </button>
          </div>
        </div>
      )}

      <div className={`relative transition-[height] duration-300 ease-out ${outerHeightClass}`}>
        <div
          ref={stageCardRef}
          className={`glass-panel rounded-2xl relative overflow-hidden w-full transition-[border-radius] duration-200 ${
            stageMode === "minimized" ? "h-[56px]" : "h-full"
          }`}
          data-testid="unified-graph-stage"
        >
          {/* Unified Header / Control Bar (Always visible, acts as the 56px bar when minimized!) */}
          <div className="absolute top-0 left-0 right-0 h-[56px] px-3.5 sm:px-4 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-[#070a0f]/90 via-[#070a0f]/70 to-transparent pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2.5 min-w-0">
              {/* 3D | 2D Segmented Switcher */}
              <div
                className="inline-flex p-0.5 rounded-xl bg-[#0b1018]/90 backdrop-blur-md border border-white/15"
                role="tablist"
                aria-label="Dimensão do grafo"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={dimension === "3d"}
                  onClick={() => {
                    setDimension("3d");
                    if (stageMode === "minimized") onStageModeChange("auto");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-colors ${
                    dimension === "3d"
                      ? "bg-primary text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  data-testid="switch-3d"
                >
                  3D Neural
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={dimension === "2d"}
                  onClick={() => {
                    setDimension("2d");
                    if (stageMode === "minimized") onStageModeChange("auto");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-colors ${
                    dimension === "2d"
                      ? "bg-emerald-400 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  data-testid="switch-2d"
                >
                  2D Obsidian
                </button>
              </div>

              {stageMode === "minimized" ? (
                <span className="font-mono text-xs text-slate-400 truncate hidden sm:inline">
                  {selectedNodes.length > 0
                    ? `${selectedNodes.map((n) => n.label).join(" + ")} (${highlight.intersectionRepoIds.size} pontes)`
                    : `${nodes.length} nós prontos · clique em Abrir para visualizar`}
                </span>
              ) : (
                <span className="font-mono text-[11px] text-slate-400 hidden lg:inline truncate">
                  {dimension === "3d"
                    ? "arraste p/ girar · scroll p/ zoom · clique nos nós"
                    : "arraste nós p/ puxar conexões · scroll p/ zoom"}
                </span>
              )}
            </div>

            {/* Right Controls: Legend + Minimize + Expand */}
            <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
              {!isCompact && (
                <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0b1018]/80 border border-white/10 text-[11px] text-slate-300 mr-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-sky-400" /> Tech
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rotate-45 bg-purple-400" /> Conceito
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-200" /> Repo
                  </span>
                </div>
              )}

              {stageMode === "minimized" ? (
                <button
                  type="button"
                  onClick={() => onStageModeChange("auto")}
                  className="px-3 py-1.5 rounded-xl bg-primary text-slate-950 text-xs font-bold transition-colors"
                  data-testid="btn-open-graph"
                >
                  Abrir Grafo
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onStageModeChange("minimized")}
                    className="px-2.5 py-1.5 rounded-xl bg-[#0b1018]/85 hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-300 transition-colors"
                    title="Minimizar grafo para focar nos projetos"
                    data-testid="btn-minimize-graph"
                  >
                    Minimizar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStageModeChange(stageMode === "expanded" ? "auto" : "expanded")
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#0b1018]/85 hover:bg-primary hover:text-slate-950 border border-white/15 text-xs font-semibold text-slate-200 transition-colors"
                    data-testid="btn-expand-graph"
                  >
                    {stageMode === "expanded" ? "Tamanho normal" : "Tela cheia"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Graph Canvas Container (fades & pauses smoothly when minimized or scrolled past!) */}
          <div
            ref={canvasOpacityRef}
            className={`w-full h-full transition-opacity duration-200 ${
              stageMode === "minimized" ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {stageMode !== "minimized" &&
              (dimension === "2d" ? (
                <Canvas2D
                  nodes={nodes}
                  edges={edges}
                  selectedFilterIds={selectedFilterIds}
                  focusedRepoId={focusedRepoId}
                  highlight={highlight}
                  paused={isCompact}
                  onToggleFilterNode={onToggleFilterNode}
                  onFocusRepoNode={onFocusRepoNode}
                  onHoverNode={setHoveredNode}
                />
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full bg-[#06090e] flex items-center justify-center font-mono text-xs text-slate-400">
                      Inicializando motor 3D...
                    </div>
                  }
                >
                  <Canvas3D
                    nodes={nodes}
                    edges={edges}
                    selectedFilterIds={selectedFilterIds}
                    focusedRepoId={focusedRepoId}
                    highlight={highlight}
                    paused={isCompact}
                    onToggleFilterNode={onToggleFilterNode}
                    onFocusRepoNode={onFocusRepoNode}
                    onHoverNode={setHoveredNode}
                  />
                </Suspense>
              ))}
          </div>

          {/* Hover Tooltip */}
          {!isCompact && hoveredNode && !focusedNode && (
            <div className="absolute bottom-3.5 left-4 z-20 max-w-xs px-3.5 py-2.5 rounded-xl bg-[#070a0f]/90 backdrop-blur-md border border-white/15 pointer-events-none">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredNode.color }}
                />
                <span className="font-display font-bold text-sm text-white truncate">
                  {hoveredNode.label}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                  {hoveredNode.type}
                </span>
              </div>
              {hoveredNode.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {hoveredNode.description}
                </p>
              )}
              <p className="font-mono text-[10px] text-sky-400 mt-1">
                {hoveredNode.degree} conexões · clique para{" "}
                {hoveredNode.type === "repo" ? "inspecionar" : "filtrar ligações"}
              </p>
            </div>
          )}

          {/* Focused Repo Inspector */}
          {!isCompact && focusedNode && (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-20 p-4 rounded-2xl bg-[#070a0f]/92 backdrop-blur-xl border border-amber-400/40 shadow-2xl">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-amber-300 uppercase">
                    Repositório focado
                  </span>
                  <h4 className="font-display font-bold text-base text-white">
                    {focusedNode.label}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onFocusRepoNode(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
                >
                  ✕
                </button>
              </div>
              {focusedNode.description && (
                <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
                  {focusedNode.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="font-mono text-xs text-slate-400">
                  {focusedNode.degree} conexões ativas
                </span>
                {focusedNode.url && (
                  <a
                    href={focusedNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-primary text-slate-950 text-xs font-bold"
                  >
                    Abrir GitHub ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnifiedGraphStage;
