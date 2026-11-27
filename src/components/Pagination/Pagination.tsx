import type { ReactElement } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps): ReactElement => {
  if (totalPages <= 1) return <></>;

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex justify-center mt-8" aria-label="Paginação">
      <nav className="glass-panel inline-flex items-center gap-1 p-1 rounded-xl">
        <button
          type="button"
          aria-label="Página anterior"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          data-testid="pagination-prev"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>

        {pages.map((page) => (
          <button
            type="button"
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg text-xs font-mono font-semibold transition-colors ${
              page === currentPage
                ? "bg-primary text-slate-950 shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10"
            }`}
            onClick={() => onPageChange(page)}
            data-testid={`pagination-page-${page}`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          aria-label="Próxima página"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-white/10 disabled:opacity-40 transition-colors"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          data-testid="pagination-next"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
