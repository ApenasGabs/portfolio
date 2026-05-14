import type { ReactElement } from "react";
import { useEffect, useState } from "react";

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface ProfileSidebarProps {
  totalStars?: number;
  topRepos?: Array<{ name: string; stargazers_count: number; html_url: string; language: string | null; updated_at: string }>;
}

const ProfileSidebar = ({ totalStars = 0, topRepos = [] }: ProfileSidebarProps): ReactElement => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://api.github.com/users/apenasgabs");
        if (res.ok) {
          const data: GitHubUser = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <aside className="lg:col-span-4 space-y-6">
      {/* Profile Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-6 text-center lg:text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-500/20 to-primary/20 dark:from-orange-500/40 dark:to-primary/40 pointer-events-none" />

        <div className="relative pt-12">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center lg:items-start gap-4">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto lg:mx-0" />
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto lg:mx-0" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto lg:mx-0" />
              <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : user ? (
            <>
              <img
                alt={`Avatar de ${user.login}`}
                className="h-24 w-24 rounded-full border-4 border-card-light dark:border-card-dark mx-auto lg:mx-0 shadow-md"
                src={user.avatar_url}
              />
              <div className="mt-4">
                <h2 className="text-2xl font-bold">{user.name ?? user.login}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{user.login}</p>
              </div>
              {user.bio && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {user.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600 dark:text-gray-400 justify-center lg:justify-start">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">place</span>
                    <span>{user.location}</span>
                  </div>
                )}
                {user.blog && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">link</span>
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
                  <span className="material-symbols-outlined text-base">hub</span>
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

              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border-light dark:border-border-dark text-center">
                <div>
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {user.public_repos}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Repos</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {user.followers >= 1000
                      ? `${(user.followers / 1000).toFixed(1)}k`
                      : user.followers}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Seguidores</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {user.following}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Seguindo</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Erro ao carregar perfil.</p>
          )}
        </div>
      </div>

      {/* GitHub Stats Card */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-waka-pink">
          <span className="material-symbols-outlined">analytics</span>
          GitHub Stats
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon: "grade", color: "text-yellow-500", label: "Total de Stars", val: totalStars.toString() },
            { icon: "source", color: "text-blue-500", label: "Repos Públicos", val: user?.public_repos?.toString() ?? "—" },
            { icon: "group", color: "text-green-500", label: "Seguidores", val: user?.followers?.toString() ?? "—" },
            { icon: "person_add", color: "text-purple-500", label: "Seguindo", val: user?.following?.toString() ?? "—" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <span className="font-bold text-lg">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Starred Repos */}
      {topRepos.length > 0 && (
        <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-xl">star</span>
            Mais Estrelados
          </h3>
          <ul className="space-y-4">
            {topRepos.slice(0, 4).map((repo) => (
              <li
                key={repo.name}
                className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">code</span>
                  </div>
                  <div className="flex flex-col">
                    <a
                      className="font-medium text-sm hover:text-primary transition-colors"
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {repo.name}
                    </a>
                    <span className="text-xs text-gray-500">{repo.language ?? "—"}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
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
