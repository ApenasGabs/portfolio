import type { ReactElement } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps): ReactElement => {
  if (totalPages <= 1) return <></>;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-10" aria-label="Paginação">
      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
        <button
          aria-label="Página anterior"
          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          data-testid="pagination-prev"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
              page === currentPage
                ? "z-10 bg-primary text-white ring-primary"
                : "text-gray-900 dark:text-gray-100 ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onPageChange(page)}
            data-testid={`pagination-page-${page}`}
          >
            {page}
          </button>
        ))}

        {totalPages > 5 && (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700">
            ...
          </span>
        )}

        <button
          aria-label="Próxima página"
          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          data-testid="pagination-next"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
