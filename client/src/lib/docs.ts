export type DocItem = { id: string; title: string; url: string; tags: ("ar" | "en")[] };
export async function fetchDocs(): Promise<DocItem[]> {
  const r = await fetch("/api/docs", { cache: "no-store" });
  if (!r.ok) throw new Error("docs fetch failed");
  const data = await r.json();
  return (data.docs ?? []) as DocItem[];
}
