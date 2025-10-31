import * as React from "react";

export default function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [msgs, setMsgs] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [busy, setBusy] = React.useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...msgs, { role: "user" as const, content: input }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...next,
          ],
        }),
      });
      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      setMsgs((m) => [...m, { role: "assistant", content: text }]);
    } catch (error: any) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: error?.message || "Unable to reach chat service.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-80 h-96 rounded-2xl border bg-white shadow-xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b font-semibold">Chat</div>
          <div className="flex-1 p-3 space-y-2 overflow-auto">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-xl whitespace-pre-wrap ${
                  m.role === "user" ? "bg-orange-100 ml-auto" : "bg-gray-100"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && <div className="text-xs text-gray-500">…</div>}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
              placeholder="Type a message"
              disabled={busy}
            />
            <button
              onClick={send}
              disabled={busy}
              className="rounded-xl bg-orange-500 text-white px-4 py-2 text-sm disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-orange-500 text-white px-5 py-3 shadow-lg"
      >
        {open ? "×" : "Chat"}
      </button>
    </div>
  );
}
