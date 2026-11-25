import { Card, EmptyState, ErrorState, Pagination, Skeleton, cn } from "@/ui";

/**
 * The admin list view: a table from `md` up, stacked cards on phones (each
 * column becomes a "label: value" line). One component, so every admin list
 * looks and behaves the same.
 *
 *   <AdminTable query={useQuery(...)} columns={[{ key, header, cell, className, primary }]}
 *     onRowClick={(row) => …} page={page} onPage={setPage} empty="…" />
 *
 * `primary` columns lead the phone card (title line); the rest follow.
 */
const AdminTable = ({ query, columns, onRowClick, rowKey = (r) => r._id, page, onPage, empty }) => {
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = query;
  const rows = data?.results ?? (Array.isArray(data) ? data : []);

  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  if (isLoading) {
    return (
      <Card padded={false} className="space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (!rows.length) return <EmptyState title={empty} />;

  const primary = columns.filter((c) => c.primary);
  const rest = columns.filter((c) => !c.primary);
  const clickable = Boolean(onRowClick);

  return (
    <div className={cn(isPlaceholderData && "opacity-60 transition-opacity")}>
      {/* Desktop / tablet: table */}
      <Card padded={false} className="hidden overflow-x-auto md:block">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-line bg-sunken/60 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn("px-4 py-3 text-start font-semibold", c.className)}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={clickable ? () => onRowClick(row) : undefined}
                className={cn(clickable && "cursor-pointer hover:bg-sunken/60")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Phones: cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            <Card
              as={clickable ? "button" : "div"}
              type={clickable ? "button" : undefined}
              padded={false}
              onClick={clickable ? () => onRowClick(row) : undefined}
              className="block w-full p-4 text-start"
            >
              <div className="space-y-1">
                {primary.map((c) => (
                  <div key={c.key}>{c.cell(row)}</div>
                ))}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {rest.map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="text-xs text-fg-subtle">{c.header}</dt>
                    <dd className="truncate">{c.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </li>
        ))}
      </ul>

      {onPage ? <Pagination page={page} totalPages={data?.totalPages} onChange={onPage} /> : null}
    </div>
  );
};

export default AdminTable;

/** Page frame shared by every admin screen. */
export const AdminPage = ({ title, description, actions, children }) => (
  <div className="mx-auto w-full max-w-7xl">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
    {children}
  </div>
);

/** Filters row above a table. */
export const AdminFilters = ({ children, className }) => (
  <div
    className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}
  >
    {children}
  </div>
);

/** Two-line cell: bold primary + muted secondary. */
export const Cell = ({ title, sub }) => (
  <div className="min-w-0">
    <p className="truncate font-medium text-fg">{title}</p>
    {sub ? <p className="truncate text-xs text-fg-subtle">{sub}</p> : null}
  </div>
);
