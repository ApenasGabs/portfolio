import type { ReactElement } from "react";

interface UserLang {
  language: string;
  quantity: number;
}

interface LanguageStatsProps {
  langs: UserLang[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-cyan-600",
  Java: "bg-orange-700",
  CSS: "bg-purple-500",
  HTML: "bg-orange-500",
  Rust: "bg-orange-800",
  Go: "bg-cyan-500",
  Shell: "bg-gray-600",
  Vue: "bg-green-500",
  Kotlin: "bg-violet-500",
  Other: "bg-gray-400",
};

const getLangColor = (language: string): string =>
  LANG_COLORS[language] ?? "bg-gray-400";

const LanguageStats = ({ langs }: LanguageStatsProps): ReactElement => {
  const total = langs.reduce((sum, l) => sum + l.quantity, 0);
  const top = langs
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map((l) => ({
      ...l,
      percent: Math.round((l.quantity / total) * 100),
    }));

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-8 mb-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-waka-pink">Linguagens por Repo</h3>
      </div>

      <div className="w-full h-3 flex rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-10">
        {top.map((lang, idx) => (
          <div
            key={idx}
            className={`h-full ${getLangColor(lang.language)}`}
            style={{ width: `${lang.percent}%` }}
            title={`${lang.language}: ${lang.percent}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {top.map((lang, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1 border-b border-border-light/50 dark:border-border-dark/50"
          >
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${getLangColor(lang.language)}`} />
              <span className="text-sm font-medium">{lang.language}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {lang.quantity} repo{lang.quantity !== 1 ? "s" : ""} · {lang.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageStats;
