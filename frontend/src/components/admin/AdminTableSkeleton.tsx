/** Placeholder matching the admin tables' row shape (image thumbnail + text
 * columns), shown while a list is still loading. */
export default function AdminTableSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-rose-100">
      <table className="min-w-full divide-y divide-rose-100 text-sm">
        <tbody className="divide-y divide-rose-50 bg-white">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              <td className="px-4 py-3">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-rose-100" />
              </td>
              {Array.from({ length: columns - 1 }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-rose-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
