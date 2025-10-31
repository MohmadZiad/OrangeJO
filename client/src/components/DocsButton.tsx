import * as React from "react";
import { fetchDocs, type DocItem } from "../lib/docs";

export default function DocsButton() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<DocItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetchDocs()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border px-6 py-2 shadow-sm bg-white/70 hover:bg-white text-sm"
      >
        المستندات
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-64 max-h-96 overflow-auto rounded-2xl border bg-white shadow-lg p-2">
          {loading && <div className="p-2 text-sm opacity-60">Loading…</div>}
          {!loading &&
            items.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-orange-50"
                title={d.url}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{d.title}</span>
                  <span className="text-[10px] rounded-full px-2 py-[2px] bg-gray-100">
                    {d.tags.join("/").toUpperCase()}
                  </span>
                </div>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
