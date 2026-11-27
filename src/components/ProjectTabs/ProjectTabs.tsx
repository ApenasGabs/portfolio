import type { ReactElement } from "react";

interface Project {
  name: string;
  url: string;
  color?: string;
  badge?: string;
  disabled?: boolean;
}

const PROJECTS: Project[] = [
  { name: "EcoNow", url: "https://econow.apenasgabs.dev", color: "bg-emerald-400" },
  { name: "Guia de TI", url: "https://guia.apenasgabs.dev", color: "bg-sky-400" },
  { name: "Quero Casa", url: "https://querocasa.apenasgabs.dev", color: "bg-amber-400", badge: "NEW" },
  { name: "Quero Vagas", url: "https://querovagas.apenasgabs.dev", color: "bg-blue-400" },
  { name: "Ghibli List", url: "https://ghibli.list.apenasgabs.dev", color: "bg-purple-400" },
  { name: "Simple List", url: "https://simplelist.apenasgabs.dev", color: "bg-teal-400" },
  { name: "Meu Estoque", url: "https://meuestoque.apenasgabs.dev", color: "bg-rose-400" },
  { name: "ApenasBlog", url: "https://apenasblog.vercel.app", color: "bg-indigo-400" },
];

const ProjectTabs = (): ReactElement => (
  <nav
    aria-label="Projetos"
    className="flex overflow-x-auto gap-2.5 mb-6 py-1.5 pr-6 scrollbar-hide projects-dock-mask"
  >
    {PROJECTS.map((proj) => (
      <a
        key={proj.name}
        aria-label={`Visitar ${proj.name}`}
        className={`glass-panel inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-full text-[13px] font-medium whitespace-nowrap text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-sky-600 dark:hover:text-white transition-colors ${
          proj.disabled ? "opacity-50 pointer-events-none" : ""
        }`}
        href={proj.disabled ? "#" : proj.url}
        target={proj.disabled ? undefined : "_blank"}
        rel="noopener noreferrer"
        data-testid={`project-tab-${proj.name.replace(/\s/g, "-").toLowerCase()}`}
      >
        {proj.color && <span className={`w-2 h-2 rounded-full ${proj.color} shrink-0`} />}
        <span>{proj.name}</span>
        {proj.badge && (
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-primary">
            {proj.badge}
          </span>
        )}
      </a>
    ))}
  </nav>
);

export default ProjectTabs;
