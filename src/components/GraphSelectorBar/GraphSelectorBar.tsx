import type { ReactElement } from "react";
import { useState } from "react";

import type { GraphNode } from "../../types/graph";
import type { FilterMatchMode } from "../../utils/graphFilter";

interface GraphSelectorBarProps {
  nodes: GraphNode[];
  selectedIds: string[];
  matchMode: FilterMatchMode;
  intersectionCount: number;
  filteredCount: number;
  sortBy: string;
  onToggleNode: (id: string) => void;
  onClear: () => void;
  onMatchModeChange: (mode: FilterMatchMode) => void;
  onSortChange: (val: string) => void;
}

const GraphSelectorBar = ({
  nodes,
  selectedIds,
  matchMode,
  intersectionCount,
  filteredCount,
  sortBy,
  onToggleNode,
  onClear,
  onMatchModeChange,
  onSortChange,
}: GraphSelectorBarProps): ReactElement => {
  const [showAllTechs, setShowAllTechs] = useState(false);

  const techNodes = nodes
    .filter((n) => n.type === "tech")
    .sort((a, b) => b.degree - a.degree);

  const conceptNodes = nodes
    .filter((n) => n.type === "concept")
    .sort((a, b) => b.degree - a.degree);

  const visibleTechs = showAllTechs ? techNodes : techNodes.slice(0, 14);
  const selectedNodes = selectedIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is GraphNode => Boolean(n));

  return (
    <div className="glass-panel rounded-2xl p-4 mb-5 space-y-3.5" data-testid="graph-selector-bar">
      {/* Active Selection Summary + Match Mode (AND / OR) + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-light dark:border-white/[0.07]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Conexões do Grafo:
          </span>
          {selectedNodes.length === 0 ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Clique em 2+ tecnologias ou conceitos (aqui ou nos nós do grafo) para ver quais repositórios os conectam
            </span>
          ) : (
            <>
              {selectedNodes.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => onToggleNode(n.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/15 border border-sky-400/50 text-sky-700 dark:text-sky-200 hover:bg-red-500/20 hover:border-red-400/50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
                  <span>{n.label}</span>
                  <span className="opacity-70">✕</span>
                </button>
              ))}
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-mono text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline ml-1"
                data-testid="clear-graph-filters"
              >
                Limpar
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {selectedNodes.length >= 2 && (
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-900/90 border border-border-light dark:border-white/10 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => onMatchModeChange("AND")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  matchMode === "AND"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                title="Mostra apenas repositórios conectados a TODOS os itens selecionados"
                data-testid="mode-and"
              >
                Interseção ({intersectionCount})
              </button>
              <button
                type="button"
                onClick={() => onMatchModeChange("OR")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  matchMode === "OR"
                    ? "bg-primary text-slate-950"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                title="Mostra repositórios conectados a QUALQUER item selecionado"
                data-testid="mode-or"
              >
                União ({filteredCount})
              </button>
            </div>
          )}

          <select
            aria-label="Ordenar repositórios"
            className="pl-2.5 pr-7 py-1.5 text-xs font-medium border border-border-light dark:border-border-dark rounded-lg bg-white/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            data-testid="filter-sort"
          >
            <option value="updated">Mais recentes</option>
            <option value="connections">Mais conexões</option>
            <option value="stars">Mais estrelas</option>
            <option value="name">Nome (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Concepts / Semantic Domains from README & Manifests */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
          Domínios & Conceitos (extraídos de README e arquitetura):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {conceptNodes.map((c) => {
            const active = selectedIds.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => onToggleNode(c.id)}
                data-testid={`chip-${c.id}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? "bg-purple-500/20 border-purple-400 text-purple-800 dark:text-purple-200 shadow-sm"
                    : "border-border-light dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:border-purple-400/50"
                }`}
              >
                <span className="w-2 h-2 rotate-45 shrink-0" style={{ backgroundColor: c.color }} />
                <span>{c.label}</span>
                <span className="font-mono text-[10px] opacity-60">{c.degree}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Technologies & Languages */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Linguagens, Frameworks & Infraestrutura:
          </span>
          {techNodes.length > 14 && (
            <button
              type="button"
              onClick={() => setShowAllTechs((p) => !p)}
              className="font-mono text-[11px] text-primary hover:underline"
            >
              {showAllTechs ? "Mostrar principais" : `Ver todas (${techNodes.length})`}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visibleTechs.map((t) => {
            const active = selectedIds.includes(t.id);
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => onToggleNode(t.id)}
                data-testid={`chip-${t.id}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? "bg-sky-500/20 border-sky-400 text-sky-800 dark:text-sky-200 shadow-sm"
                    : "border-border-light dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:border-sky-400/50"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span>{t.label}</span>
                <span className="font-mono text-[10px] opacity-60">{t.degree}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GraphSelectorBar;
