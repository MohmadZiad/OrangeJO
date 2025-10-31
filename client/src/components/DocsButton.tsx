import * as React from "react";
import { fetchDocs, type DocItem } from "../lib/docs";

export default function DocsButton({ lang = "ar" as "ar" | "en" }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<DocItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetchDocs()
      .then((d) => setItems(d))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => i.tags.includes(lang));

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border px-6 py-2 shadow-sm bg-white/70 hover:bg-white text-sm"
      >
        {lang === "ar" ? "المستندات" : "Documents"}
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-64 max-h-80 overflow-auto rounded-2xl border bg-white shadow-lg p-2">
          {loading && <div className="p-2 text-sm opacity-60">Loading…</div>}
          {!loading &&
            filtered.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-orange-50"
                onClick={() => setOpen(false)}
              >
                {d.title}
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
