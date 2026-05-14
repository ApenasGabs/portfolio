import type { ReactElement } from "react";

interface Project {
  name: string;
  url: string;
  color?: string;
  badge?: string;
  badgeClass?: string;
  disabled?: boolean;
}

const PROJECTS: Project[] = [
  { name: "EcoNow", url: "https://econow.apenasgabs.dev", color: "bg-green-500" },
  { name: "Guia de TI", url: "https://guia.apenasgabs.dev", color: "bg-blue-500" },
  { name: "Quero 🏠", url: "https://querocasa.apenasgabs.dev", badge: "NEW", badgeClass: "bg-yellow-100 text-yellow-800" },
  { name: "Quero 👨‍💻", url: "https://querotrampo.apenasgabs.dev", badge: "SOON", badgeClass: "bg-orange-100 text-orange-800", disabled: true },
  { name: "Ghibli List", url: "https://ghibli.list.apenasgabs.dev", color: "bg-purple-500" },
  { name: "Simple List", url: "https://simplelist.apenasgabs.dev", color: "bg-teal-500" },
  { name: "Meu Estoque", url: "https://meuestoque.apenasgabs.dev", color: "bg-rose-500" },
  { name: "ApenasBlog", url: "https://apenasblog.vercel.app", color: "bg-indigo-500" },
];

const ProjectTabs = (): ReactElement => (
  <nav aria-label="Projetos" className="flex overflow-x-auto gap-4 mb-8 py-2 scrollbar-hide">
    {PROJECTS.map((proj) => (
      <a
        key={proj.name}
        aria-label={`Visitar ${proj.name}`}
        className={`flex items-center gap-2 px-4 py-2 bg-card-light dark:bg-card-dark rounded-full text-sm font-medium whitespace-nowrap border border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary transition-colors shadow-sm ${
          proj.disabled ? "opacity-60 pointer-events-none" : ""
        }`}
        href={proj.disabled ? "#" : proj.url}
        target={proj.disabled ? undefined : "_blank"}
        rel="noopener noreferrer"
        data-testid={`project-tab-${proj.name.replace(/\s/g, "-").toLowerCase()}`}
      >
        {proj.color && (
          <span className={`w-2 h-2 rounded-full ${proj.color} shrink-0`} />
        )}
        {proj.name}
        {proj.badge && (
          <span className={`${proj.badgeClass} text-[10px] px-1.5 rounded-sm font-bold`}>
            {proj.badge}
          </span>
        )}
      </a>
    ))}
  </nav>
);

export default ProjectTabs;
