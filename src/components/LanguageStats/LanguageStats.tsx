import type { ReactElement } from "react";

interface UserLang {
  language: string;
  quantity: number;
}

interface LanguageStatsProps {
  langs: UserLang[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-sky-400",
  JavaScript: "bg-amber-400",
  Python: "bg-teal-400",
  Java: "bg-orange-500",
  CSS: "bg-violet-400",
  HTML: "bg-rose-400",
  Rust: "bg-orange-600",
  Go: "bg-cyan-400",
  Shell: "bg-slate-400",
  Vue: "bg-emerald-400",
  Kotlin: "bg-purple-400",
  Other: "bg-slate-500",
};

const getLangColor = (language: string): string =>
  LANG_COLORS[language] ?? "bg-slate-400";

const LanguageStats = ({ langs }: LanguageStatsProps): ReactElement => {
  const total = langs.reduce((sum, l) => sum + l.quantity, 0) || 1;
  const top = [...langs]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map((l) => ({
      ...l,
      percent: Math.max(1, Math.round((l.quantity / total) * 100)),
    }));

  return (
    <div className="glass-panel rounded-2xl p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-primary" />
          Linguagens por Repo
        </h2>
      </div>

      <div className="w-full h-2.5 flex gap-0.5 rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.05] mb-6">
        {top.map((lang) => (
          <div
            key={lang.language}
            className={`h-full ${getLangColor(lang.language)}`}
            style={{ width: `${lang.percent}%` }}
            title={`${lang.language}: ${lang.percent}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {top.map((lang) => (
          <div
            key={lang.language}
            className="flex items-center justify-between py-1.5 border-b border-border-light/60 dark:border-white/[0.06]"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${getLangColor(lang.language)}`} />
              <span className="text-sm font-medium">{lang.language}</span>
            </div>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {lang.quantity} repo{lang.quantity !== 1 ? "s" : ""} · {lang.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageStats;
