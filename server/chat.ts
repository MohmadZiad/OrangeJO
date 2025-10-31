import type { Request, Response } from "express";

export async function chatHandler(req: Request, res: Response) {
  try {
    const { messages } = req.body as { messages: { role: string; content: string }[] };
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // choose a lightweight fast model
        messages,
        temperature: 0.2,
      }),
    });
    const data = await r.json();
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "chat error" });
  }
}
