import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import FilterBar from "../../components/FilterBar/FilterBar";
import LanguageStats from "../../components/LanguageStats/LanguageStats";
import Pagination from "../../components/Pagination/Pagination";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import ProjectTabs from "../../components/ProjectTabs/ProjectTabs";
import RepoCard from "../../components/RepoCard/RepoCard";
import { ReposProps } from "../../types";

interface UserLang {
  language: string;
  quantity: number;
}

const REPOS_PER_PAGE = 6;

const Dashboard = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOverview = location.pathname === "/overview";

  useEffect(() => {
    document.title = isOverview
      ? "Todos os Repositórios | ApenasGabs — Gabriel Rodrigues"
      : "ApenasGabs — Gabriel Rodrigues | Desenvolvedor Front-End React";
  }, [isOverview]);

  const [repos, setRepos] = useState<ReposProps[]>([]);
  const [langs, setLangs] = useState<UserLang[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("updated");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let allRepos: ReposProps[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const url = `https://api.github.com/users/apenasgabs/repos?per_page=100&page=${page}`;
          const result = await axios.get<ReposProps[]>(url);
          if (result.status === 200) {
            allRepos = allRepos.concat(result.data);
            hasMore = result.data.length === 100;
            page++;
          } else {
            hasMore = false;
          }
        }

        const sorted = allRepos.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setRepos(sorted);

        const langCount = allRepos.reduce<Record<string, number>>((count, repo) => {
          const lang = repo.language;
          if (lang) {
            count[lang] = (count[lang] ?? 0) + 1;
          }
          return count;
        }, {});

        const userLangs: UserLang[] = Object.entries(langCount).map(([language, quantity]) => ({
          language,
          quantity,
        }));

        setLangs(userLangs);
        const defaultSelected = userLangs
          .map((l) => l.language)
          .filter((l) => ["Java", "TypeScript", "JavaScript"].includes(l));
        setSelectedLangs(defaultSelected.length > 0 ? defaultSelected : userLangs.map((l) => l.language));
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar repositórios. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLangToggle = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const sortedRepos = [...repos].sort((a, b) => {
    if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const filteredRepos =
    selectedLangs.length === langs.length || selectedLangs.length === 0
      ? sortedRepos
      : sortedRepos.filter((r) => r.language && selectedLangs.includes(r.language));

  const totalPages = Math.ceil(filteredRepos.length / REPOS_PER_PAGE);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * REPOS_PER_PAGE,
    currentPage * REPOS_PER_PAGE
  );

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4)
    .map((r) => ({
      name: r.name,
      stargazers_count: r.stargazers_count,
      html_url: r.html_url,
      language: r.language ?? null,
      updated_at: r.updated_at,
    }));

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectTabs />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar totalStars={totalStars} topRepos={topRepos} />

          <section className="lg:col-span-8">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                aria-current={!isOverview ? "page" : undefined}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  !isOverview
                    ? "bg-waka-pink text-white shadow-md"
                    : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:border-waka-pink"
                }`}
                onClick={() => navigate("/")}
                data-testid="tab-dashboard"
              >
                Dashboard
              </button>
              <button
                aria-current={isOverview ? "page" : undefined}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isOverview
                    ? "bg-waka-pink text-white shadow-md"
                    : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:border-waka-pink"
                }`}
                onClick={() => navigate("/overview")}
                data-testid="tab-overview"
              >
                Todos os Repos
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-300 text-sm">
                <span className="material-symbols-outlined text-base mr-2">error</span>
                {error}
              </div>
            )}

            {!isOverview ? (
              <>
                {/* Dashboard view: Language Stats + Featured Repos */}
                {loading ? (
                  <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-8 mb-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <LanguageStats langs={langs} />
                )}

                <FilterBar
                  langs={langs.map((l) => l.language)}
                  selectedLangs={selectedLangs}
                  onLangToggle={handleLangToggle}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                />

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 h-48"
                      >
                        <div className="flex gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedRepos.slice(0, 4).map((repo) => (
                      <RepoCard key={repo.id} repo={repo} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Overview: full repo list with pagination */}
                <FilterBar
                  langs={langs.map((l) => l.language)}
                  selectedLangs={selectedLangs}
                  onLangToggle={handleLangToggle}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  showSort
                />

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 h-48"
                      >
                        <div className="flex gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                    <p>Nenhum repositório encontrado com os filtros selecionados.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      {filteredRepos.length} repositório{filteredRepos.length !== 1 ? "s" : ""} encontrado{filteredRepos.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paginatedRepos.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} />
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
