import type { ReactElement } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = (): ReactElement => {
  const [isDark, setIsDark] = useState(true);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card-light/90 dark:bg-card-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
            <span className="font-bold text-xl tracking-tight">GitDash</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-sm">search</span>
              </div>
              <input
                aria-label="Buscar usuário GitHub"
                className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-full leading-5 bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                placeholder="Buscar usuário GitHub..."
                type="search"
                data-testid="navbar-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              onClick={toggleDarkMode}
              data-testid="navbar-theme-toggle"
            >
              <span className="material-symbols-outlined dark:hidden">dark_mode</span>
              <span className="material-symbols-outlined hidden dark:block">light_mode</span>
            </button>
            <img
              alt="Avatar do usuário"
              className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700"
              src="https://avatars.githubusercontent.com/u/ApenasGabs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=AG&background=ec5b13&color=fff";
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
