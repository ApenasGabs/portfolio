import type { ReactElement } from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { GraphEdge, GraphNode } from "../../types/graph";
import type { GraphHighlightState } from "../../utils/graphFilter";

export interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedFilterIds: string[];
  focusedRepoId: string | null;
  highlight: GraphHighlightState;
  paused?: boolean;
  onToggleFilterNode: (nodeId: string) => void;
  onFocusRepoNode: (repoId: string | null) => void;
  onHoverNode: (node: GraphNode | null) => void;
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  z: number;
}

function compute3DLayout(nodes: GraphNode[], edges: GraphEdge[]): Map<string, PositionedNode> {
  const posMap = new Map<string, PositionedNode>();
  const hubs = nodes.filter((n) => n.type !== "repo");
  const repos = nodes.filter((n) => n.type === "repo");

  const hubCount = Math.max(hubs.length, 1);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  hubs.forEach((h, i) => {
    const y = 1 - (i / Math.max(hubCount - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const shellRadius = h.type === "concept" ? 21 : 15;
    posMap.set(h.id, {
      ...h,
      x: Math.cos(theta) * r * shellRadius,
      y: y * shellRadius * 0.78,
      z: Math.sin(theta) * r * shellRadius,
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
    const connected = repoHubs.get(r.id) || [];
    let cx = 0, cy = 0, cz = 0;
    connected.forEach((hId) => {
      const hp = posMap.get(hId);
      if (hp) {
        cx += hp.x;
        cy += hp.y;
        cz += hp.z;
      }
    });
    if (connected.length > 0) {
      cx /= connected.length;
      cy /= connected.length;
      cz /= connected.length;
    }
    const seed = idx * 1.6180339;
    const spread = r.flagship ? 4.5 : 9.5;
    posMap.set(r.id, {
      ...r,
      x: cx * 0.85 + Math.cos(seed * 7.1) * spread,
      y: cy * 0.85 + Math.sin(seed * 5.3) * spread * 0.8,
      z: cz * 0.85 + Math.sin(seed * 11.7) * spread,
    });
  });

  const all = Array.from(posMap.values());
  for (let iter = 0; iter < 45; iter++) {
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dz = a.z - b.z;
        const distSq = dx * dx + dy * dy + dz * dz + 0.25;
        const minDist = a.type !== "repo" && b.type !== "repo" ? 8.5 : 4.2;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const push = ((minDist - dist) / dist) * 0.32;
          dx *= push;
          dy *= push;
          dz *= push;
          if (a.type === "repo") { a.x += dx; a.y += dy; a.z += dz; }
          if (b.type === "repo") { b.x -= dx; b.y -= dy; b.z -= dz; }
        }
      }
    }
    for (const e of edges) {
      const rNode = posMap.get(e.source.startsWith("repo:") ? e.source : e.target);
      const hNode = posMap.get(e.source.startsWith("repo:") ? e.target : e.source);
      if (!rNode || !hNode) continue;
      const dx = hNode.x - rNode.x;
      const dy = hNode.y - rNode.y;
      const dz = hNode.z - rNode.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const pull = ((dist - 11.5) / dist) * 0.045 * e.weight;
      rNode.x += dx * pull;
      rNode.y += dy * pull;
      rNode.z += dz * pull;
    }
  }
  return posMap;
}

function makeLabelSprite(text: string, badgeColor: string, isHub: boolean): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = isHub ? 26 : 22;
  ctx.font = `${isHub ? "700" : "600"} ${fontSize}px "Space Grotesk", Inter, sans-serif`;
  const textWidth = Math.ceil(ctx.measureText(text).width);
  const padX = 20;
  const padY = 12;
  canvas.width = textWidth + padX * 2;
  canvas.height = fontSize + padY * 2;

  ctx.fillStyle = isHub ? "rgba(7, 11, 18, 0.86)" : "rgba(11, 16, 26, 0.78)";
  ctx.beginPath();
  ctx.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 12);
  ctx.fill();

  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = isHub ? 2.5 : 1.5;
  ctx.stroke();

  ctx.font = `${isHub ? "700" : "600"} ${fontSize}px "Space Grotesk", Inter, sans-serif`;
  ctx.fillStyle = "#f8fafc";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const scaleFactor = 0.032;
  sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);
  return sprite;
}

const Canvas3D = ({
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const posMap = useMemo(() => compute3DLayout(nodes, edges), [nodes, edges]);

  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const labelMapRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const edgeGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const pulseGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const activeEdgesRef = useRef<Array<{ a: PositionedNode; b: PositionedNode; color: THREE.Color }>>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const cbRef = useRef({ onToggleFilterNode, onFocusRepoNode, onHoverNode, focusedRepoId });
  cbRef.current = { onToggleFilterNode, onFocusRepoNode, onHoverNode, focusedRepoId };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a0f, 0.011);

    const isMob = width < 640;
    const camera = new THREE.PerspectiveCamera(isMob ? 60 : 50, width / height, 0.1, 300);
    camera.position.set(0, isMob ? 10 : 8, isMob ? 56 : 46);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 14;
    controls.maxDistance = 95;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 120;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.22, transparent: true, opacity: 0.26 });
    scene.add(new THREE.Points(dustGeo, dustMat));

    const edgePositions = new Float32Array(edges.length * 2 * 3);
    const edgeColors = new Float32Array(edges.length * 2 * 4);
    edges.forEach((e, idx) => {
      const a = posMap.get(e.source);
      const b = posMap.get(e.target);
      if (!a || !b) return;
      const base = idx * 6;
      edgePositions[base] = a.x;
      edgePositions[base + 1] = a.y;
      edgePositions[base + 2] = a.z;
      edgePositions[base + 3] = b.x;
      edgePositions[base + 4] = b.y;
      edgePositions[base + 5] = b.z;
    });

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeColors, 4));
    edgeGeoRef.current = edgeGeo;

    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

    const MAX_PULSES = 180;
    const pulsePos = new Float32Array(MAX_PULSES * 3);
    const pulseCol = new Float32Array(MAX_PULSES * 3);
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3));
    pulseGeo.setAttribute("color", new THREE.BufferAttribute(pulseCol, 3));
    pulseGeo.setDrawRange(0, 0);
    pulseGeoRef.current = pulseGeo;

    const pulseMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Points(pulseGeo, pulseMat));

    const meshMap = new Map<string, THREE.Mesh>();
    const labelMap = new Map<string, THREE.Sprite>();
    const pickables: THREE.Mesh[] = [];

    const sphereRepoGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const sphereFlagshipGeo = new THREE.SphereGeometry(0.88, 20, 20);
    const icoTechGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const octConceptGeo = new THREE.OctahedronGeometry(1.25, 0);

    for (const n of posMap.values()) {
      const geo =
        n.type === "tech"
          ? icoTechGeo
          : n.type === "concept"
            ? octConceptGeo
            : n.flagship
              ? sphereFlagshipGeo
              : sphereRepoGeo;

      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(n.color),
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(n.x, n.y, n.z);
      mesh.userData = { node: n };
      scene.add(mesh);
      meshMap.set(n.id, mesh);
      pickables.push(mesh);

      if (n.type !== "repo" || n.flagship || n.degree >= 3) {
        const sprite = makeLabelSprite(n.label, n.color, n.type !== "repo");
        sprite.position.set(n.x, n.y + (n.type !== "repo" ? 2.1 : 1.45), n.z);
        scene.add(sprite);
        labelMap.set(n.id, sprite);
      }
    }

    meshMapRef.current = meshMap;
    labelMapRef.current = labelMap;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (ev: PointerEvent) => {
      downPos = { x: ev.clientX, y: ev.clientY };
      controls.autoRotate = false;
    };

    const onPointerMove = (ev: PointerEvent) => {
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length > 0) {
        cbRef.current.onHoverNode(hits[0].object.userData.node as GraphNode);
        renderer.domElement.style.cursor = "pointer";
      } else {
        cbRef.current.onHoverNode(null);
        renderer.domElement.style.cursor = "grab";
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y) > 6) return;
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      if (hits.length > 0) {
        const hitNode = hits[0].object.userData.node as GraphNode;
        if (hitNode.type === "repo") {
          const next = cbRef.current.focusedRepoId === hitNode.id ? null : hitNode.id;
          cbRef.current.onFocusRepoNode(next);
        } else {
          cbRef.current.onToggleFilterNode(hitNode.id);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 10 && h > 10) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(container);

    let frameId = 0;
    let elapsed = 0;
    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (document.hidden || pausedRef.current) return;
      elapsed += 0.012;
      controls.update();

      const activeList = activeEdgesRef.current;
      const pGeo = pulseGeoRef.current;
      if (pGeo && activeList.length > 0) {
        const count = Math.min(activeList.length * 2, MAX_PULSES);
        const posArr = pGeo.attributes.position.array as Float32Array;
        const colArr = pGeo.attributes.color.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const edgeItem = activeList[i % activeList.length];
          const phase = ((elapsed * 0.55 + i * 0.37) % 1 + 1) % 1;
          posArr[i * 3] = edgeItem.a.x + (edgeItem.b.x - edgeItem.a.x) * phase;
          posArr[i * 3 + 1] = edgeItem.a.y + (edgeItem.b.y - edgeItem.a.y) * phase;
          posArr[i * 3 + 2] = edgeItem.a.z + (edgeItem.b.z - edgeItem.a.z) * phase;
          colArr[i * 3] = edgeItem.color.r;
          colArr[i * 3 + 1] = edgeItem.color.g;
          colArr[i * 3 + 2] = edgeItem.color.b;
        }
        pGeo.setDrawRange(0, count);
        pGeo.attributes.position.needsUpdate = true;
        pGeo.attributes.color.needsUpdate = true;
      } else if (pGeo) {
        pGeo.setDrawRange(0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      sphereRepoGeo.dispose();
      sphereFlagshipGeo.dispose();
      icoTechGeo.dispose();
      octConceptGeo.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      labelMap.forEach((s) => {
        s.material.map?.dispose();
        s.material.dispose();
      });
      meshMap.forEach((m) => (m.material as THREE.Material).dispose());
      renderer.dispose();
    };
  }, [edges, posMap]);

  useEffect(() => {
    const selectedSet = new Set(selectedFilterIds);
    for (const [id, mesh] of meshMapRef.current.entries()) {
      const n = mesh.userData.node as GraphNode;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const label = labelMapRef.current.get(id);

      if (!highlight.hasActiveSelection) {
        mat.color.set(n.color);
        mat.opacity = n.type === "repo" ? (n.flagship ? 0.95 : 0.72) : 0.95;
        mesh.scale.setScalar(1);
        if (label) {
          label.visible = (n.type !== "repo" && n.degree >= 6) || Boolean(n.flagship);
          label.material.opacity = n.type !== "repo" ? 0.92 : 0.82;
        }
      } else {
        const isSelectedHub = selectedSet.has(id);
        const isIntersectionRepo = highlight.intersectionRepoIds.has(id);
        const isFocused = focusedRepoId === id;
        const isActive = highlight.activeNodeIds.has(id);

        if (isSelectedHub || isFocused) {
          mat.color.set(isFocused ? "#fbbf24" : n.color);
          mat.opacity = 1;
          mesh.scale.setScalar(1.45);
          if (label) { label.visible = true; label.material.opacity = 1; }
        } else if (isIntersectionRepo) {
          mat.color.set(selectedFilterIds.length >= 2 ? "#fbbf24" : "#38bdf8");
          mat.opacity = 1;
          mesh.scale.setScalar(1.38);
          if (label) { label.visible = true; label.material.opacity = 0.98; }
        } else if (isActive) {
          mat.color.set(n.color);
          mat.opacity = 0.72;
          mesh.scale.setScalar(1.05);
          if (label) {
            label.visible = n.type !== "repo" || Boolean(n.flagship);
            label.material.opacity = 0.75;
          }
        } else {
          mat.color.set("#334155");
          mat.opacity = 0.1;
          mesh.scale.setScalar(0.8);
          if (label) label.visible = false;
        }
      }
    }

    const eGeo = edgeGeoRef.current;
    const nextPulses: Array<{ a: PositionedNode; b: PositionedNode; color: THREE.Color }> = [];
    if (eGeo) {
      const colArr = eGeo.attributes.color.array as Float32Array;
      edges.forEach((e, idx) => {
        const key = `${e.source}->${e.target}`;
        const hubNode = posMap.get(e.source.startsWith("repo:") ? e.target : e.source);
        const repoNode = posMap.get(e.source.startsWith("repo:") ? e.source : e.target);
        const baseColor = new THREE.Color(hubNode?.color || "#38bdf8");

        let alpha = 0.13;
        if (highlight.hasActiveSelection) {
          if (highlight.bridgeEdgeKeys.has(key)) {
            alpha = 0.92;
            if (hubNode && repoNode) nextPulses.push({ a: hubNode, b: repoNode, color: baseColor });
          } else if (highlight.activeEdgeKeys.has(key)) {
            alpha = 0.42;
          } else {
            alpha = 0.025;
          }
        }
        const base = idx * 8;
        colArr[base] = baseColor.r;
        colArr[base + 1] = baseColor.g;
        colArr[base + 2] = baseColor.b;
        colArr[base + 3] = alpha;
        colArr[base + 4] = baseColor.r;
        colArr[base + 5] = baseColor.g;
        colArr[base + 6] = baseColor.b;
        colArr[base + 7] = alpha;
      });
      eGeo.attributes.color.needsUpdate = true;
    }
    activeEdgesRef.current = nextPulses;
  }, [edges, posMap, highlight, selectedFilterIds, focusedRepoId]);

  return <div ref={containerRef} className="w-full h-full bg-[#06090e]" data-testid="canvas-3d" />;
};

export default Canvas3D;
