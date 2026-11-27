import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import type { GraphNode } from "../../types/graph";

import type { GraphCanvasProps } from "./Canvas3D";

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pinned?: boolean;
}

const Canvas2D = ({
  nodes,
  edges,
  selectedFilterIds,
  focusedRepoId,
  highlight,
  paused = false,
  onToggleFilterNode,
  onFocusRepoNode,
  onHoverNode,
}: GraphCanvasProps): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const stateRef = useRef({
    highlight,
    selectedFilterIds,
    focusedRepoId,
    onToggleFilterNode,
    onFocusRepoNode,
    onHoverNode,
  });
  stateRef.current = {
    highlight,
    selectedFilterIds,
    focusedRepoId,
    onToggleFilterNode,
    onFocusRepoNode,
    onHoverNode,
  };

  const viewRef = useRef({ x: 0, y: 0, k: 0.62 });
  const targetViewRef = useRef<{ x: number; y: number; k: number } | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const alphaRef = useRef(1);

  useEffect(() => {
    alphaRef.current = Math.max(alphaRef.current, 0.22);
    const wrap = wrapRef.current;
    if (!wrap || simNodesRef.current.length === 0) return;

    if (!highlight.hasActiveSelection) {
      targetViewRef.current = { x: 0, y: 0, k: wrap.clientWidth < 640 ? 0.46 : 0.62 };
      return;
    }

    const activeNodes = simNodesRef.current.filter(
      (n) =>
        selectedFilterIds.includes(n.id) ||
        highlight.intersectionRepoIds.has(n.id) ||
        focusedRepoId === n.id
    );
    if (activeNodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of activeNodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = Math.max(maxX - minX + 140, 220);
    const spanY = Math.max(maxY - minY + 140, 180);
    const k = Math.min(
      1.25,
      Math.max(0.45, Math.min(wrap.clientWidth / spanX, wrap.clientHeight / spanY) * 0.82)
    );
    targetViewRef.current = { x: -cx * k, y: -cy * k, k };
  }, [selectedFilterIds, focusedRepoId, highlight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hubs = nodes.filter((n) => n.type !== "repo");
    const repos = nodes.filter((n) => n.type === "repo");
    const simMap = new Map<string, SimNode>();

    hubs.forEach((h, i) => {
      const angle = (i / Math.max(hubs.length, 1)) * Math.PI * 2;
      const ring = h.type === "concept" ? 290 : 195;
      simMap.set(h.id, {
        ...h,
        x: Math.cos(angle) * ring,
        y: Math.sin(angle) * ring * 0.78,
        vx: 0,
        vy: 0,
        radius: h.type === "concept" ? 9.5 : Math.min(12, 6.5 + Math.sqrt(h.degree) * 0.7),
      });
    });

    const repoHubs = new Map<string, string[]>();
    for (const e of edges) {
      const rId = e.source.startsWith("repo:") ? e.source : e.target;
      const hId = e.source.startsWith("repo:") ? e.target : e.source;
      if (!repoHubs.has(rId)) repoHubs.set(rId, []);
      repoHubs.get(rId)!.push(hId);
    }

    repos.forEach((r, idx) => {
      const list = repoHubs.get(r.id) || [];
      let cx = 0, cy = 0;
      list.forEach((hid) => {
        const h = simMap.get(hid);
        if (h) { cx += h.x; cy += h.y; }
      });
      if (list.length > 0) { cx /= list.length; cy /= list.length; }
      const a = idx * 2.39996;
      const dist = r.flagship ? 35 : 70 + (idx % 5) * 14;
      simMap.set(r.id, {
        ...r,
        x: cx * 0.85 + Math.cos(a) * dist,
        y: cy * 0.85 + Math.sin(a) * dist,
        vx: 0,
        vy: 0,
        radius: r.flagship ? 6.8 : 4.2,
      });
    });

    const simNodes = Array.from(simMap.values());
    simNodesRef.current = simNodes;

    // Frame active selection immediately if mounted while filters are already active!
    if (stateRef.current.highlight.hasActiveSelection) {
      const activeNodes = simNodes.filter(
        (n) =>
          stateRef.current.selectedFilterIds.includes(n.id) ||
          stateRef.current.highlight.intersectionRepoIds.has(n.id) ||
          stateRef.current.focusedRepoId === n.id
      );
      if (activeNodes.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const n of activeNodes) {
          if (n.x < minX) minX = n.x;
          if (n.x > maxX) maxX = n.x;
          if (n.y < minY) minY = n.y;
          if (n.y > maxY) maxY = n.y;
        }
        const w = wrap.clientWidth || 800;
        const h = wrap.clientHeight || 420;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const spanX = Math.max(maxX - minX + 160, 240);
        const spanY = Math.max(maxY - minY + 160, 200);
        const k = Math.min(1.25, Math.max(0.45, Math.min(w / spanX, h / spanY) * 0.8));
        viewRef.current = { x: -cx * k, y: -cy * k, k };
      }
    }

    const resolvedEdges = edges
      .map((e) => ({
        edge: e,
        key: `${e.source}->${e.target}`,
        source: simMap.get(e.source)!,
        target: simMap.get(e.target)!,
      }))
      .filter((item) => item.source && item.target);

    const stepPhysics = (alpha: number) => {
      for (let i = 0; i < simNodes.length; i++) {
        const a = simNodes[i];
        for (let j = i + 1; j < simNodes.length; j++) {
          const b = simNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy + 16;
          if (d2 > 36000) continue;
          const force = ((a.type !== "repo" && b.type !== "repo" ? 1150 : 340) * alpha) / d2;
          const fx = dx * force;
          const fy = dy * force;
          if (!a.pinned) { a.vx += fx; a.vy += fy; }
          if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
        }
      }
      for (const item of resolvedEdges) {
        const { source: s, target: tg, edge } = item;
        const dx = tg.x - s.x;
        const dy = tg.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = ((dist - 88) / dist) * 0.018 * edge.weight * alpha;
        const fx = dx * f;
        const fy = dy * f;
        if (!s.pinned) { s.vx += fx; s.vy += fy; }
        if (!tg.pinned) { tg.vx -= fx * 0.45; tg.vy -= fy * 0.45; }
      }
      for (const n of simNodes) {
        if (n.pinned) continue;
        n.vx -= n.x * 0.0016 * alpha;
        n.vy -= n.y * 0.002 * alpha;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      }
    };

    for (let i = 0; i < 85; i++) stepPhysics(0.9);
    alphaRef.current = 0.35;

    let width = wrap.clientWidth || 800;
    let height = wrap.clientHeight || 420;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 10 || h < 10) return;
      width = w;
      height = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (width < 640 && viewRef.current.k === 0.62) {
        viewRef.current.k = 0.46;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const screenToWorld = (sx: number, sy: number) => ({
      x: (sx - width / 2 - viewRef.current.x) / viewRef.current.k,
      y: (sy - height / 2 - viewRef.current.y) / viewRef.current.k,
    });

    const pickNode = (sx: number, sy: number): SimNode | null => {
      const w = screenToWorld(sx, sy);
      let best: SimNode | null = null;
      let bestDist = Infinity;
      for (const n of simNodes) {
        const hitR = Math.max(n.radius + 6 / viewRef.current.k, 10 / viewRef.current.k);
        const d = Math.hypot(n.x - w.x, n.y - w.y);
        if (d <= hitR && d < bestDist) {
          best = n;
          bestDist = d;
        }
      }
      return best;
    };

    let draggedNode: SimNode | null = null;
    let isPanning = false;
    let downScreen = { x: 0, y: 0 };
    let lastScreen = { x: 0, y: 0 };

    const onPointerDown = (ev: PointerEvent) => {
      targetViewRef.current = null;
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      downScreen = { x: sx, y: sy };
      lastScreen = { x: sx, y: sy };
      const hit = pickNode(sx, sy);
      if (hit) {
        draggedNode = hit;
        draggedNode.pinned = true;
        alphaRef.current = Math.max(alphaRef.current, 0.55);
      } else {
        isPanning = true;
      }
      canvas.setPointerCapture(ev.pointerId);
    };

    const onPointerMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      if (draggedNode) {
        const w = screenToWorld(sx, sy);
        draggedNode.x = w.x;
        draggedNode.y = w.y;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
        alphaRef.current = Math.max(alphaRef.current, 0.45);
        canvas.style.cursor = "grabbing";
        return;
      }
      if (isPanning) {
        viewRef.current.x += sx - lastScreen.x;
        viewRef.current.y += sy - lastScreen.y;
        lastScreen = { x: sx, y: sy };
        canvas.style.cursor = "grabbing";
        return;
      }
      const hit = pickNode(sx, sy);
      hoveredIdRef.current = hit?.id ?? null;
      stateRef.current.onHoverNode(hit);
      canvas.style.cursor = hit ? "pointer" : "grab";
    };

    const onPointerUp = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      const moved = Math.hypot(sx - downScreen.x, sy - downScreen.y);
      if (draggedNode) {
        draggedNode.pinned = false;
        if (moved < 6) {
          if (draggedNode.type === "repo") {
            const next = stateRef.current.focusedRepoId === draggedNode.id ? null : draggedNode.id;
            stateRef.current.onFocusRepoNode(next);
          } else {
            stateRef.current.onToggleFilterNode(draggedNode.id);
          }
        }
        draggedNode = null;
      }
      isPanning = false;
      canvas.style.cursor = "grab";
    };

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      targetViewRef.current = null;
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left - width / 2;
      const sy = ev.clientY - rect.top - height / 2;
      const factor = ev.deltaY < 0 ? 1.12 : 0.89;
      const prevK = viewRef.current.k;
      const nextK = Math.min(2.8, Math.max(0.32, prevK * factor));
      viewRef.current.x = sx - ((sx - viewRef.current.x) / prevK) * nextK;
      viewRef.current.y = sy - ((sy - viewRef.current.y) / prevK) * nextK;
      viewRef.current.k = nextK;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let frameId = 0;
    let t = 0;
    const render = () => {
      frameId = window.requestAnimationFrame(render);
      if (document.hidden || pausedRef.current) return;

      t += 0.012;
      if (targetViewRef.current) {
        const tv = targetViewRef.current;
        viewRef.current.x += (tv.x - viewRef.current.x) * 0.09;
        viewRef.current.y += (tv.y - viewRef.current.y) * 0.09;
        viewRef.current.k += (tv.k - viewRef.current.k) * 0.09;
        if (
          Math.abs(tv.x - viewRef.current.x) < 0.4 &&
          Math.abs(tv.y - viewRef.current.y) < 0.4 &&
          Math.abs(tv.k - viewRef.current.k) < 0.005
        ) {
          targetViewRef.current = null;
        }
      }
      if (alphaRef.current > 0.008) {
        stepPhysics(alphaRef.current);
        alphaRef.current *= 0.985;
      }

      const { highlight: hl, selectedFilterIds: selIds, focusedRepoId: focId } = stateRef.current;
      const hoveredId = hoveredIdRef.current;
      const selectedSet = new Set(selIds);

      const hoverNeighborIds = new Set<string>();
      const hoverEdgeKeys = new Set<string>();
      if (!hl.hasActiveSelection && hoveredId) {
        hoverNeighborIds.add(hoveredId);
        for (const item of resolvedEdges) {
          if (item.edge.source === hoveredId || item.edge.target === hoveredId) {
            hoverEdgeKeys.add(item.key);
            hoverNeighborIds.add(item.edge.source);
            hoverNeighborIds.add(item.edge.target);
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      const v = viewRef.current;
      ctx.save();
      ctx.fillStyle = "rgba(148, 163, 184, 0.08)";
      const step = 36 * v.k;
      if (step >= 14) {
        const ox = ((width / 2 + v.x) % step + step) % step;
        const oy = ((height / 2 + v.y) % step + step) % step;
        for (let gx = ox; gx < width; gx += step) {
          for (let gy = oy; gy < height; gy += step) {
            ctx.fillRect(gx, gy, 1.2, 1.2);
          }
        }
      }
      ctx.restore();

      ctx.save();
      ctx.translate(width / 2 + v.x, height / 2 + v.y);
      ctx.scale(v.k, v.k);

      for (const item of resolvedEdges) {
        const { source: s, target: tg, key } = item;
        const hub = s.type === "repo" ? tg : s;

        let alpha = 0.13;
        let lineW = 0.9 / v.k;
        let sendPulse = false;

        if (hl.hasActiveSelection) {
          if (hl.bridgeEdgeKeys.has(key)) {
            alpha = 0.9;
            lineW = 2.2 / v.k;
            sendPulse = true;
          } else if (hl.activeEdgeKeys.has(key)) {
            alpha = 0.38;
            lineW = 1.3 / v.k;
          } else {
            alpha = 0.025;
          }
        } else if (hoveredId) {
          if (hoverEdgeKeys.has(key)) {
            alpha = 0.82;
            lineW = 1.9 / v.k;
            sendPulse = true;
          } else {
            alpha = 0.04;
          }
        }

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = hub.color;
        ctx.lineWidth = lineW;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tg.x, tg.y);
        ctx.stroke();

        if (sendPulse) {
          const phase = ((t * 0.7 + (s.x + tg.y) * 0.003) % 1 + 1) % 1;
          const px = tg.x + (s.x - tg.x) * phase;
          const py = tg.y + (s.y - tg.y) * phase;
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(px, py, 2.5 / v.k, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const n of simNodes) {
        const isSelected = selectedSet.has(n.id);
        const isBridge = hl.intersectionRepoIds.has(n.id);
        const isFocused = focId === n.id;
        const isHovered = hoveredId === n.id;

        let alpha = n.type === "repo" ? (n.flagship ? 0.95 : 0.78) : 0.98;
        let fill = n.color;
        let r = n.radius;

        if (hl.hasActiveSelection) {
          if (isSelected || isFocused) {
            alpha = 1;
            r *= 1.35;
            if (isFocused) fill = "#fbbf24";
          } else if (isBridge) {
            alpha = 1;
            r *= 1.35;
            fill = selIds.length >= 2 ? "#fbbf24" : "#38bdf8";
          } else if (hl.activeNodeIds.has(n.id)) {
            alpha = 0.75;
          } else {
            alpha = 0.09;
          }
        } else if (hoveredId) {
          if (hoverNeighborIds.has(n.id)) {
            alpha = 1;
            if (isHovered) r *= 1.25;
          } else {
            alpha = 0.14;
          }
        }

        ctx.globalAlpha = alpha;
        if (isSelected || isBridge || isFocused || isHovered || n.type !== "repo") {
          ctx.fillStyle = fill;
          ctx.globalAlpha = alpha * 0.2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alpha;
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        if (n.type === "concept") {
          ctx.moveTo(n.x, n.y - r * 1.15);
          ctx.lineTo(n.x + r * 1.15, n.y);
          ctx.lineTo(n.x, n.y + r * 1.15);
          ctx.lineTo(n.x - r * 1.15, n.y);
          ctx.closePath();
        } else {
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        }
        ctx.fill();

        const showLabel =
          n.type !== "repo" ||
          n.flagship ||
          isBridge ||
          isFocused ||
          isHovered ||
          (hoveredId && hoverNeighborIds.has(n.id)) ||
          v.k >= 1.25;

        if (showLabel && alpha > 0.2) {
          const fontSize = (n.type !== "repo" ? 12.5 : 11) / Math.pow(v.k, 0.35);
          ctx.font = `${n.type !== "repo" || isBridge ? "600" : "500"} ${fontSize}px "Inter", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "rgba(7, 10, 15, 0.82)";
          const tw = ctx.measureText(n.label).width;
          ctx.fillRect(n.x - tw / 2 - 4, n.y + r + 3, tw + 8, fontSize + 4);
          ctx.fillStyle = isBridge && selIds.length >= 2 ? "#fde68a" : "#f1f5f9";
          ctx.fillText(n.label, n.x, n.y + r + 5);
        }
      }
      ctx.restore();
    };

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [nodes, edges]);

  return (
    <div ref={wrapRef} className="w-full h-full bg-[#06090e]" data-testid="canvas-2d">
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
    </div>
  );
};

export default Canvas2D;
