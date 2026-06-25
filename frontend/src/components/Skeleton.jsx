export function SkeletonRow({ columns = 4 }) {
  return (
    <tr className="border-t border-tokio-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-tokio-border animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-tokio-panel border border-tokio-border p-4">
      <div className="h-3 w-20 rounded bg-tokio-border animate-pulse mb-2" />
      <div className="h-5 w-28 rounded bg-tokio-border animate-pulse" />
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`rounded bg-tokio-border animate-pulse ${className}`} />;
}
