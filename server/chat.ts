import type { Request, Response } from "express";
import { readDocs } from "./docs";

const SITE_ROUTES = [
  { path: "/", title: "Home" },
  { path: "/assistant", title: "Assistant" },
  { path: "/pro-rata", title: "Pro-Rata Calculator" },
  { path: "/docs", title: "Documents" },
];

export async function chatHandler(req: Request, res: Response) {
  try {
    const { messages } = req.body as { messages: { role: string; content: string }[] };
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const docs = await readDocs();
    const navContext = {
      routes: SITE_ROUTES,
      docs: docs.map((d) => ({ id: d.id, title: d.title, url: d.url })),
    };

    const system = {
      role: "system" as const,
      content: `You are a helpful website assistant for OrangeCompany.
- If the user asks how to do or find something in the site, reply with a short answer AND a direct link using one of these routes: ${SITE_ROUTES.map((r) => `${r.title} (${r.path})`).join(", ")}.
- If the user asks for a document, choose from the provided docs list and return a direct Google Docs link.
- Prefer Arabic when the user writes in Arabic; otherwise use English.
- Keep answers concise and actionable.`,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          system,
          { role: "system", content: `NAV_CONTEXT_JSON:\n${JSON.stringify(navContext)}` },
          ...(messages ?? []),
        ],
      }),
    });

    const data = await r.json();
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "chat error" });
  }
}
