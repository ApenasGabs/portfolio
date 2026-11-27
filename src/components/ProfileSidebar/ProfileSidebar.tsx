import type { ReactElement } from "react";

import type { GraphUser as GitHubUser } from "../../types/graph";

interface ProfileSidebarProps {
  user: GitHubUser | null;
  loading: boolean;
  totalStars?: number;
  topRepos?: Array<{
    name: string;
    stargazers_count: number;
    html_url: string;
    language: string | null;
    updated_at: string;
  }>;
}

const ProfileSidebar = ({
  user,
  loading,
  totalStars = 0,
  topRepos = [],
}: ProfileSidebarProps): ReactElement => {
  return (
    <aside className="lg:col-span-4 space-y-5">
      {/* Profile Card */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div
          className="h-20 border-b border-border-light dark:border-border-dark"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.24), transparent 62%), radial-gradient(circle at 85% 30%, rgba(249,115,22,0.16), transparent 58%), linear-gradient(135deg, rgba(13,23,38,0.42) 0%, rgba(17,24,39,0.28) 100%)",
          }}
        />

        <div className="px-5 pb-6">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-3 -mt-9">
              <div className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-14 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ) : user ? (
            <>
              <img
                alt={`Avatar de ${user.login}`}
                className="h-20 w-20 rounded-2xl border-[3px] border-white dark:border-[#0b1018] -mt-10 shadow-lg object-cover bg-slate-800"
                src={user.avatar_url}
              />
              <div className="mt-3">
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {user.name ?? user.login}
                </h1>
                <p className="font-mono text-xs text-sky-600 dark:text-primary mt-0.5">
                  @{user.login}
                </p>
              </div>
              {user.bio && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3.5 mt-4 text-xs text-slate-600 dark:text-slate-400">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-accent-warm">place</span>
                    <span>{user.location}</span>
                  </div>
                )}
                {user.blog && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">link</span>
                    <a
                      className="hover:text-primary transition-colors truncate max-w-[160px]"
                      href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.blog.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">hub</span>
                  <a
                    className="hover:text-primary transition-colors"
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-border-light dark:border-border-dark text-center">
                <div>
                  <span className="block font-display text-xl font-bold tabular-nums">
                    {user.public_repos}
                  </span>
                  <span className="text-[11px] text-slate-500">Repos</span>
                </div>
                <div>
                  <span className="block font-display text-xl font-bold tabular-nums">
                    {user.followers >= 1000
                      ? `${(user.followers / 1000).toFixed(1)}k`
                      : user.followers}
                  </span>
                  <span className="text-[11px] text-slate-500">Seguidores</span>
                </div>
                <div>
                  <span className="block font-display text-xl font-bold tabular-nums">
                    {user.following}
                  </span>
                  <span className="text-[11px] text-slate-500">Seguindo</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 pt-4">Erro ao carregar perfil.</p>
          )}
        </div>
      </div>

      {/* GitHub Stats Card */}
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-primary" />
          GitHub Stats
        </h2>
        <div className="space-y-3">
          {[
            { label: "Total de Stars", val: totalStars.toString() },
            { label: "Repos Públicos", val: user?.public_repos?.toString() ?? "—" },
            { label: "Seguidores", val: user?.followers?.toString() ?? "—" },
            { label: "Seguindo", val: user?.following?.toString() ?? "—" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
              <span className="font-mono font-semibold tabular-nums">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Starred Repos */}
      {topRepos.length > 0 && (
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="font-display text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-amber-400" />
            Mais Estrelados
          </h2>
          <ul className="space-y-3">
            {topRepos.slice(0, 4).map((repo) => (
              <li
                key={repo.name}
                className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0 gap-2"
              >
                <div className="min-w-0">
                  <a
                    className="font-semibold text-sm hover:text-primary transition-colors block truncate"
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                  <span className="text-xs text-slate-500">{repo.language ?? "—"}</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-600 dark:text-amber-300 shrink-0">
                  ★ {repo.stargazers_count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default ProfileSidebar;
