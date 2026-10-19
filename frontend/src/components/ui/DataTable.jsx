import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import Button from './Button';
import { SkeletonRows } from './Skeleton';

/*
  columns: [{
    key, header, align ('left'|'right'), sortable, sortValue(row), render(row),
    className, mono (use tabular monospace)
  }]
*/
const DataTable = ({
  columns,
  rows,
  rowKey,
  onRowClick,
  defaultSort,
  pageSize,
  loading = false,
  empty = null,
  caption,
  maxHeight,
  dense = false,
}) => {
  const [sort, setSort] = useState(defaultSort || null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = col.sortValue || ((r) => r[col.key]);
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x == null && y == null) return 0;
      if (x == null) return 1; // blanks always last
      if (y == null) return -1;
      if (typeof x === 'string') return x.localeCompare(y) * dir;
      return (x - y) * dir;
    });
  }, [rows, sort, columns]);

  // Jump back to page one whenever the data or ordering changes.
  useEffect(() => setPage(0), [rows, sort]);

  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const visible = pageSize ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((cur) =>
      cur?.key === col.key
        ? { key: col.key, dir: cur.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: col.align === 'right' ? 'desc' : 'asc' }
    );
  };

  const pad = dense ? 'px-3 py-2' : 'px-4 py-2.5';

  return (
    <div>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full min-w-max border-collapse text-table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-[1] bg-card">
            <tr className="border-b border-line">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const ariaSort = active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`${pad} text-meta font-medium text-ink-3 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c)}
                        className={`inline-flex items-center gap-1 rounded transition-colors hover:text-ink ${
                          active ? 'text-ink' : ''
                        } ${c.align === 'right' ? 'flex-row-reverse' : ''}`}
                      >
                        {c.header}
                        {active ? (
                          sort.dir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              visible.map((row, i) => {
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={rowKey ? rowKey(row, i) : i}
                    onClick={clickable ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={clickable ? 0 : undefined}
                    className={`border-b border-line/60 last:border-0 transition-colors ${
                      clickable ? 'cursor-pointer hover:bg-elevated/70 focus-visible:bg-elevated/70' : ''
                    }`}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`${pad} ${c.align === 'right' ? 'text-right' : 'text-left'} ${
                          c.mono ? 'num' : ''
                        } ${c.className || ''}`}
                      >
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {loading && <SkeletonRows rows={6} className="p-4" />}
      {!loading && rows.length === 0 && empty}

      {pageSize && !loading && rows.length > pageSize && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
          <p className="num text-meta text-ink-3">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="num px-1 text-meta text-ink-2">
              {page + 1} / {pages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
