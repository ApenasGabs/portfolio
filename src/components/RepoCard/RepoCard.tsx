import type { ReactElement } from "react";

import { ReposProps } from "../../types";

interface RepoCardProps {
  repo: ReposProps;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500 text-white",
  JavaScript: "bg-yellow-400 text-black",
  Python: "bg-cyan-600 text-white",
  Java: "bg-orange-700 text-white",
  CSS: "bg-purple-500 text-white",
  HTML: "bg-orange-500 text-white",
  Rust: "bg-orange-800 text-white",
  Go: "bg-cyan-500 text-white",
  Shell: "bg-gray-600 text-white",
  Vue: "bg-green-500 text-white",
  Kotlin: "bg-violet-500 text-white",
};

const getLangColor = (language: string): string =>
  LANG_COLORS[language] ?? "bg-gray-500 text-white";

const getLangAbbr = (language: string): string =>
  language.slice(0, 2).toUpperCase();

const RepoCard = ({ repo }: RepoCardProps): ReactElement => {
  const langColor = getLangColor(repo.language ?? "Other");
  const langAbbr = getLangAbbr(repo.language ?? "??");
  const updatedDate = new Date(repo.updated_at).toLocaleDateString("pt-BR");

  return (
    <div
      className="group bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      data-testid={`repo-card-${repo.id}`}
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${langColor} flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}
              aria-label={`Linguagem: ${repo.language ?? "Desconhecida"}`}
            >
              {langAbbr}
            </div>
            <div>
              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                {repo.name}
              </h4>
              {repo.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {repo.description}
                </span>
              )}
            </div>
          </div>
          {repo.language && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
              {repo.language}
            </span>
          )}
        </div>

        <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-gray-400">update</span>
            <span>Atualizado: {updatedDate}</span>
          </div>
          {repo.fork && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-gray-400">fork_right</span>
              <span className="text-xs text-gray-400">Fork</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-yellow-500">star</span>
              {repo.stargazers_count}
            </span>
          )}
          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-gray-400">fork_right</span>
              {repo.forks_count}
            </span>
          )}
        </div>
        <a
          aria-label={`Ver ${repo.name} no GitHub`}
          className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors duration-200"
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`repo-card-link-${repo.id}`}
        >
          Ver <span className="material-symbols-outlined text-sm ml-1">open_in_new</span>
        </a>
      </div>
    </div>
  );
};

export default RepoCard;
