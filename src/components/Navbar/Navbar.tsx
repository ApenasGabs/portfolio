import type { ReactElement } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const Navbar = ({ searchQuery, onSearchChange }: NavbarProps): ReactElement => {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : true
  );

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/75 dark:bg-[#070a0f]/75 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" data-testid="navbar-logo">
            <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center font-mono text-xs font-semibold text-sky-600 dark:text-primary">
              ag
            </span>
            <span className="font-display font-bold text-lg tracking-tight">ApenasGabs</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-base">search</span>
              </div>
              <input
                aria-label="Filtrar repositórios"
                className="block w-full pl-10 pr-8 py-2 border border-border-light dark:border-border-dark rounded-xl leading-5 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 text-sm transition-colors"
                placeholder="Filtrar repositórios por nome ou descrição..."
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                data-testid="navbar-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              className="w-10 h-10 rounded-xl border border-border-light dark:border-border-dark bg-white/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary flex items-center justify-center transition-colors"
              onClick={toggleDarkMode}
              data-testid="navbar-theme-toggle"
            >
              <span className="material-symbols-outlined text-[20px] dark:hidden">dark_mode</span>
              <span className="material-symbols-outlined text-[20px] hidden dark:block">light_mode</span>
            </button>
            <img
              alt="Avatar do usuário"
              className="h-9 w-9 rounded-xl border border-border-light dark:border-white/15 object-cover"
              src="https://avatars.githubusercontent.com/u/52265978?v=4"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=AG&background=0ea5e9&color=fff";
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
