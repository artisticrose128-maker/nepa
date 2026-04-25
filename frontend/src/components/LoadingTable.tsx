import React from 'react';

interface LoadingTableProps {
  /** Number of rows to show */
  rows?: number;
  /** Number of columns to show */
  columns?: number;
  /** Show header skeleton */
  showHeader?: boolean;
  /** Custom column widths */
  columnWidths?: string[];
  /** Custom className */
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  columnWidths = [],
  className = '',
}) => {
  const defaultColumnWidths = Array.from({ length: columns }, (_, i) => {
    if (columnWidths[i]) return columnWidths[i];
    return i === columns - 1 ? '60%' : '100%';
  });

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      role="status"
      aria-label="Loading table data"
      aria-busy="true"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    <div 
                      className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"
                      style={{ width: defaultColumnWidths[i] }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    <div 
                      className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"
                      style={{ width: defaultColumnWidths[colIndex] }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="sr-only">Loading table data...</span>
    </div>
  );
};

export default LoadingTable;
