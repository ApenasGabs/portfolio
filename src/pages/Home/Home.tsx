import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import GraphSelectorBar from "../../components/GraphSelectorBar/GraphSelectorBar";
import LanguageStats from "../../components/LanguageStats/LanguageStats";
import Pagination from "../../components/Pagination/Pagination";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import ProjectTabs from "../../components/ProjectTabs/ProjectTabs";
import RepoCard from "../../components/RepoCard/RepoCard";
import UnifiedGraphStage, {
  type StageSizeMode,
} from "../../components/UnifiedGraph/UnifiedGraphStage";
import rawGraphData from "../../data/graphIndex.json";
import type { GraphIndexData } from "../../types/graph";
import { computeGraphHighlight, type FilterMatchMode } from "../../utils/graphFilter";

const graphData = rawGraphData as unknown as GraphIndexData;
const REPOS_PER_PAGE = 6;

interface DashboardProps {
  searchQuery?: string;
}

const Dashboard = ({ searchQuery = "" }: DashboardProps): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOverview = location.pathname === "/overview";

  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);
  const [focusedRepoId, setFocusedRepoId] = useState<string | null>(null);
  const [matchMode, setMatchMode] = useState<FilterMatchMode>("AND");
  const [sortBy, setSortBy] = useState("updated");
  const [currentPage, setCurrentPage] = useState(1);
  const [stageMode, setStageMode] = useState<StageSizeMode>("auto");

  useEffect(() => {
    document.title = isOverview
      ? "Todos os Repositórios | ApenasGabs — Gabriel Rodrigues"
      : "ApenasGabs — Gabriel Rodrigues | Full Stack Software Engineer";
  }, [isOverview]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilterIds, matchMode]);

  const handleToggleFilterNode = (nodeId: string) => {
    setFocusedRepoId(null);
    setSelectedFilterIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const handleClearFilters = () => {
    setSelectedFilterIds([]);
    setFocusedRepoId(null);
  };

  const highlight = useMemo(
    () =>
      computeGraphHighlight(
        graphData.nodes,
        graphData.edges,
        selectedFilterIds,
        focusedRepoId,
        matchMode
      ),
    [selectedFilterIds, focusedRepoId, matchMode]
  );

  const langs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of graphData.repos) {
      if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([language, quantity]) => ({ language, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, []);

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...graphData.repos];

    if (selectedFilterIds.length > 0) {
      list = list.filter((r) =>
        matchMode === "AND"
          ? highlight.intersectionRepoIds.has(r.nodeId)
          : highlight.intersectionRepoIds.has(r.nodeId) || highlight.partialRepoIds.has(r.nodeId)
      );
    } else if (focusedRepoId) {
      list = list.filter((r) => r.nodeId === focusedRepoId);
    }

    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          r.techs.some((t) => t.toLowerCase().includes(q)) ||
          r.concepts.some((c) => c.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (selectedFilterIds.length >= 2) {
        const aBridge = highlight.intersectionRepoIds.has(a.nodeId) ? 1 : 0;
        const bBridge = highlight.intersectionRepoIds.has(b.nodeId) ? 1 : 0;
        if (aBridge !== bBridge) return bBridge - aBridge;
      }
      if (sortBy === "connections") {
        return b.techs.length + b.concepts.length - (a.techs.length + a.concepts.length);
      }
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return list;
  }, [searchQuery, selectedFilterIds, focusedRepoId, matchMode, sortBy, highlight]);

  const totalPages = Math.ceil(filteredRepos.length / REPOS_PER_PAGE);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * REPOS_PER_PAGE,
    currentPage * REPOS_PER_PAGE
  );

  const totalStars = useMemo(
    () => graphData.repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    []
  );

  const topRepos = useMemo(
    () =>
      [...graphData.repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 4)
        .map((r) => ({
          name: r.name,
          stargazers_count: r.stargazers_count,
          html_url: r.html_url,
          language: r.language,
          updated_at: r.updated_at,
        })),
    []
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ProjectTabs />

      {/* Unified 3D + 2D Knowledge Graph with Scroll-Shrink & Minimize */}
      <UnifiedGraphStage
        nodes={graphData.nodes}
        edges={graphData.edges}
        selectedFilterIds={selectedFilterIds}
        focusedRepoId={focusedRepoId}
        matchMode={matchMode}
        stageMode={stageMode}
        onStageModeChange={setStageMode}
        onToggleFilterNode={handleToggleFilterNode}
        onFocusRepoNode={(id) => {
          setFocusedRepoId(id);
          if (id) {
            if (stageMode === "minimized") setStageMode("auto");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onClearFilters={handleClearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ProfileSidebar
          user={graphData.user}
          loading={false}
          totalStars={totalStars}
          topRepos={topRepos}
        />

        <section className="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="glass-panel inline-flex p-1 rounded-xl gap-1">
              <button
                type="button"
                aria-current={!isOverview ? "page" : undefined}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  !isOverview
                    ? "bg-primary text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
                onClick={() => navigate("/")}
                data-testid="tab-dashboard"
              >
                Dashboard
              </button>
              <button
                type="button"
                aria-current={isOverview ? "page" : undefined}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isOverview
                    ? "bg-primary text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
                onClick={() => navigate("/overview")}
                data-testid="tab-overview"
              >
                Todos os Repos ({graphData.repos.length})
              </button>
            </div>

            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {graphData.stats.totalNodes} nós · {graphData.stats.totalEdges} conexões indexadas
            </span>
          </div>

          <GraphSelectorBar
            nodes={graphData.nodes}
            selectedIds={selectedFilterIds}
            matchMode={matchMode}
            intersectionCount={highlight.intersectionRepoIds.size}
            filteredCount={highlight.intersectionRepoIds.size + highlight.partialRepoIds.size}
            sortBy={sortBy}
            onToggleNode={handleToggleFilterNode}
            onClear={handleClearFilters}
            onMatchModeChange={setMatchMode}
            onSortChange={(val) => {
              setSortBy(val);
              setCurrentPage(1);
            }}
          />

          {!isOverview && selectedFilterIds.length === 0 && !focusedRepoId && (
            <LanguageStats langs={langs} />
          )}

          {filteredRepos.length === 0 ? (
            <div className="glass-panel rounded-2xl text-center py-12 px-4 text-slate-500 dark:text-slate-400 space-y-3">
              <p className="text-sm">
                Nenhum repositório conecta simultaneamente todos os itens selecionados no modo{" "}
                <strong>Interseção</strong>.
              </p>
              {selectedFilterIds.length >= 2 && matchMode === "AND" && (
                <button
                  type="button"
                  onClick={() => setMatchMode("OR")}
                  className="px-4 py-2 rounded-xl bg-primary text-slate-950 text-xs font-bold"
                >
                  Alternar para modo União (ver repos com qualquer um deles)
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-4">
                Exibindo {isOverview ? paginatedRepos.length : Math.min(6, paginatedRepos.length)} de{" "}
                {filteredRepos.length} repositório{filteredRepos.length !== 1 ? "s" : ""} conectado
                {filteredRepos.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(isOverview ? paginatedRepos : paginatedRepos.slice(0, 6)).map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    isBridgeMatch={
                      selectedFilterIds.length >= 2 &&
                      highlight.intersectionRepoIds.has(repo.nodeId)
                    }
                    isFocused={focusedRepoId === repo.nodeId}
                    onFocusInGraph={(id) => {
                      const next = focusedRepoId === id ? null : id;
                      setFocusedRepoId(next);
                      if (next) {
                        if (stageMode === "minimized") setStageMode("auto");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    onToggleTag={handleToggleFilterNode}
                  />
                ))}
              </div>
              {(isOverview || selectedFilterIds.length > 0) && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
