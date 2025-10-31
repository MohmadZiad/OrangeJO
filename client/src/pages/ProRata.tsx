import * as React from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/language-context";
import { computeProrata, buildScript, type ProrataInput, type Lang, type ProrataOutput } from "@/lib/proRata";

export default function ProRataPage() {
  const { language } = useLanguage();
  const [monthlyNet, setMonthlyNet] = React.useState<number>(50);
  const [activation, setActivation] = React.useState<string>("2025-10-14");
  const [lang, setLang] = React.useState<Lang>(language);
  const [out, setOut] = React.useState<ProrataOutput | null>(null);

  React.useEffect(() => {
    setLang(language);
  }, [language]);

  const onCalc = () => {
    const input: ProrataInput = {
      mode: "monthly",
      activationDate: activation,
      monthlyNet,
      vatRate: 0.16,
      anchorDay: 15,
    };
    const o = computeProrata(input);
    setOut(o);
  };

  const onCopy = async () => {
    if (!out) return;
    const script = buildScript(out, lang);
    await navigator.clipboard.writeText(script);
    alert(lang === "ar" ? "تم النسخ" : "Copied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-50/30 dark:to-orange-950/10">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-28 pb-10 space-y-6">
        <div className="bg-white/70 dark:bg-neutral-900/50 rounded-3xl border p-6 shadow-sm space-y-4">
          <h1 className="text-2xl font-semibold">{lang === "ar" ? "حاسبة البروراتا" : "Pro-Rata Calculator"}</h1>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="opacity-70">
                {lang === "ar" ? "الاشتراك الشهري (صافي)" : "Monthly (net)"}
              </span>
              <input
                type="number"
                value={monthlyNet}
                onChange={(e) => setMonthlyNet(Number(e.target.value))}
                className="rounded-xl border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="opacity-70">{lang === "ar" ? "تاريخ التفعيل" : "Activation date"}</span>
              <input
                type="date"
                value={activation}
                onChange={(e) => setActivation(e.target.value)}
                className="rounded-xl border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="opacity-70">Language</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="rounded-xl border px-3 py-2"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onCalc}
              className="rounded-full bg-orange-500 text-white px-6 py-2"
            >
              {lang === "ar" ? "احسب" : "Calculate"}
            </button>
            <button
              onClick={onCopy}
              disabled={!out}
              className="rounded-full border px-6 py-2 disabled:opacity-50"
            >
              {lang === "ar" ? "نسخ النص" : "Copy Script"}
            </button>
          </div>

          {out && (
            <div className="grid gap-2 md:grid-cols-3 rounded-2xl border p-4 bg-white/90 dark:bg-neutral-900/60">
              <div>
                <div className="text-xs opacity-60">% نسبة</div>
                <div className="text-2xl font-bold">{out.pctText}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">المدى</div>
                <div>{out.cycleRangeText}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">أيام</div>
                <div>{out.proDaysText}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">البروراتا</div>
                <div>{out.prorataNetText}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">الشهري</div>
                <div>{out.monthlyNetText}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
