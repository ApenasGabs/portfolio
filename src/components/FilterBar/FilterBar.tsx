import type { ReactElement } from "react";

interface FilterBarProps {
  langs: string[];
  selectedLangs: string[];
  onLangToggle: (lang: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  showSort?: boolean;
}

const FilterBar = ({
  langs,
  selectedLangs,
  onLangToggle,
  sortBy,
  onSortChange,
  showSort = false,
}: FilterBarProps): ReactElement => {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-4 mb-6 sticky top-20 z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-hide">
          <span className="text-sm font-medium text-gray-500 mr-2 shrink-0">Filtros:</span>
          <button
            aria-pressed={selectedLangs.length === langs.length}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              selectedLangs.length === langs.length
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/20"
            }`}
            onClick={() => langs.forEach((l) => !selectedLangs.includes(l) && onLangToggle(l))}
            data-testid="filter-all"
          >
            Todos
          </button>
          {langs.slice(0, 8).map((lang) => (
            <button
              key={lang}
              aria-pressed={selectedLangs.includes(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedLangs.includes(lang)
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary/20 hover:text-primary"
              }`}
              onClick={() => onLangToggle(lang)}
              data-testid={`filter-lang-${lang}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {showSort && (
          <div className="flex items-center w-full sm:w-auto shrink-0">
            <select
              aria-label="Ordenar repositórios"
              className="block w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm border border-border-light dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              data-testid="filter-sort"
            >
              <option value="updated">Último atualizado</option>
              <option value="stars">Estrelas: maior</option>
              <option value="name">Nome: A-Z</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
