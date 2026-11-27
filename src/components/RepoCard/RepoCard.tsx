import type { ReactElement } from "react";

import type { EnrichedRepo } from "../../types/graph";

interface RepoCardProps {
  repo: EnrichedRepo;
  isBridgeMatch?: boolean;
  isFocused?: boolean;
  onFocusInGraph?: (nodeId: string) => void;
  onToggleTag?: (tagNodeId: string) => void;
}

const RepoCard = ({
  repo,
  isBridgeMatch = false,
  isFocused = false,
  onFocusInGraph,
  onToggleTag,
}: RepoCardProps): ReactElement => {
  const langAbbr = (repo.language ?? "??").slice(0, 2).toUpperCase();
  const updatedDate = new Date(repo.updated_at).toLocaleDateString("pt-BR");

  return (
    <article
      className={`group glass-panel rounded-2xl transition-all duration-200 flex flex-col h-full overflow-hidden ${
        isFocused
          ? "border-amber-400/70 ring-1 ring-amber-400/40"
          : isBridgeMatch
            ? "border-sky-400/50"
            : "hover:border-primary/45"
      }`}
      data-testid={`repo-card-${repo.id}`}
    >
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-3 mb-2.5">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl border bg-sky-400/15 text-sky-600 dark:text-sky-300 border-sky-400/30 flex items-center justify-center font-mono font-bold text-xs shrink-0"
                aria-label={`Linguagem: ${repo.language ?? "Desconhecida"}`}
              >
                {langAbbr}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base group-hover:text-primary transition-colors truncate">
                    {repo.name}
                  </h3>
                  {isBridgeMatch && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300 shrink-0">
                      Ponte
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {repo.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Connected Tech & Concept Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {repo.techs.slice(0, 5).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => onToggleTag?.(`tech:${t}`)}
                className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/25 border border-sky-400/20 text-sky-700 dark:text-sky-300 transition-colors"
              >
                {t}
              </button>
            ))}
            {repo.concepts.slice(0, 2).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => onToggleTag?.(`concept:${c}`)}
                className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/25 border border-purple-400/20 text-purple-700 dark:text-purple-300 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>Atualizado: {updatedDate}</span>
          <span>{repo.techs.length + repo.concepts.length} nós ligados</span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border-light dark:border-border-dark bg-slate-50/60 dark:bg-white/[0.02] flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400">
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
              ★ {repo.stargazers_count}
            </span>
          )}
          {onFocusInGraph && (
            <button
              type="button"
              onClick={() => onFocusInGraph(repo.nodeId)}
              className="text-[11px] text-sky-600 dark:text-primary hover:underline font-sans font-semibold"
            >
              Ver no grafo
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {repo.homepage && (
            <a
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
            >
              Demo
            </a>
          )}
          <a
            aria-label={`Ver ${repo.name} no GitHub`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-light dark:border-white/15 bg-white/80 dark:bg-white/[0.06] text-slate-800 dark:text-slate-100 hover:bg-primary hover:text-slate-950 hover:border-primary transition-colors"
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`repo-card-link-${repo.id}`}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </article>
  );
};

export default RepoCard;
