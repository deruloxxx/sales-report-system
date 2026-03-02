'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage?: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, '...', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage = 20,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-2 py-3">
        <div />
        <p className="text-sm text-gray-700">
          全{totalCount}件 ({perPage}件/ページ)
        </p>
      </div>
    );
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const pageButtonBase =
    'relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';
  const activeStyle = 'bg-blue-600 text-white';
  const inactiveStyle = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
  const disabledStyle = 'opacity-50 cursor-not-allowed';

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <nav className="flex items-center gap-1" aria-label="ページネーション">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${pageButtonBase} ${inactiveStyle} ${currentPage === 1 ? disabledStyle : ''}`}
          aria-label="最初のページ"
        >
          &laquo;
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${pageButtonBase} ${inactiveStyle} ${currentPage === 1 ? disabledStyle : ''}`}
          aria-label="前のページ"
        >
          &lsaquo;
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${pageButtonBase} ${page === currentPage ? activeStyle : inactiveStyle}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${pageButtonBase} ${inactiveStyle} ${currentPage === totalPages ? disabledStyle : ''}`}
          aria-label="次のページ"
        >
          &rsaquo;
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${pageButtonBase} ${inactiveStyle} ${currentPage === totalPages ? disabledStyle : ''}`}
          aria-label="最後のページ"
        >
          &raquo;
        </button>
      </nav>

      <p className="text-sm text-gray-700">
        全{totalCount}件 ({perPage}件/ページ)
      </p>
    </div>
  );
}
