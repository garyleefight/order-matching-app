import { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  sortFn?: (a: T, b: T) => number;
}

interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  defaultSortKey?: string;
}

export default function SortableTable<T extends { id?: number }>({
  data,
  columns,
  actions,
  emptyMessage = 'No data available',
  defaultSortKey
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const column = columns.find(col => col.key === sortKey);
    if (!column || !column.sortFn) return 0;

    const result = column.sortFn(a, b);
    return sortDirection === 'asc' ? result : -result;
  });

  if (data.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="table-container">
      <table className="sortable-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                style={{
                  cursor: column.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {column.header}
                {sortKey === column.key && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(item)}</td>
              ))}
              {actions && <td className="actions">{actions(item)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
