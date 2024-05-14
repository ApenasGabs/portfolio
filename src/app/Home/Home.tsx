import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface ReposProps {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  pushed_at: string;
  created_at: string;
}

interface UserLangs {
  language: string;
  quantity: number;
}

const Home = () => {
  const [repos, setRepos] = useState<ReposProps[]>([]);
  const [langs, setLangs] = useState<UserLangs[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<ReposProps[]>([]);
  const baseUrl = "https://api.github.com/users/apenasgabs/repos";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allRepos: ReposProps[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const url = `${baseUrl}?per_page=100&page=${page}`;
          const result = await axios.get(url);
          if (result.status === 200) {
            allRepos = allRepos.concat(result.data);
            if (result.data.length < 100) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
        setRepos(
          allRepos.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          )
        );
        const langCount = allRepos.reduce(
          (count: Record<string, number>, repo) => {
            const lang = repo.language;
            if (lang) {
              if (!count[lang]) {
                count[lang] = 1;
              } else {
                count[lang]++;
              }
            }
            return count;
          },
          {}
        );
        const userLangs: UserLangs[] = Object.entries(langCount).map(
          ([language, quantity]) => ({
            language,
            quantity,
          })
        );
        setLangs(userLangs);
        setSelectedTags(
          userLangs
            .map((lang) => lang.language)
            .filter((lang) => lang === "Java" || lang === "TypeScript")
        );
        setFilteredRepos(allRepos);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (repos) {
      setFilteredRepos(
        repos.filter((repo) => selectedTags.includes(repo.language))
      );
    }
  }, [repos, selectedTags]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        if (
          container.scrollWidth - container.scrollLeft <=
          container.offsetWidth
        ) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 1;
        }
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <input
        type="checkbox"
        id="my-modal"
        className="modal-toggle"
        defaultChecked={isModalOpen}
      />
      <div className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <h2 className="text-lg font-bold">🚧 Estamos em reforma 🚧</h2>
          <p>
            Para facilitar a manutenção estou refazendo para que ele pegue meus
            repositórios de forma automática usando a API do github.
          </p>
          <p>
            Por enquanto já temos a lista dos repositórios com algumas
            informações, mas sem CSS 😅
          </p>
          <div className="modal-action">
            <a
              href="https://github.com/ApenasGabs/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Ver como isso é feito 🤔
            </a>
            <label
              htmlFor="my-modal"
              className="btn btn-primary"
              onClick={() => setIsModalOpen(false)}
            >
              Ver portfolio 👀
            </label>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center my-4">
        <span>Categories:</span>
        {langs.map((lang) => (
          <div key={lang.language}>
            <input
              type="checkbox"
              id={`tag-${lang.language}`}
              className="hidden"
              checked={selectedTags.includes(lang.language)}
              onChange={(e) => handleChange(lang.language, e.target.checked)}
            />
            <label
              htmlFor={`tag-${lang.language}`}
              className="cursor-pointer btn btn-outline btn-sm"
            >
              {lang.language}
            </label>
          </div>
        ))}
      </div>
      <div
        className="flex gap-4 flex-wrap overflow-x-auto"
        ref={scrollContainerRef}
      >
        {filteredRepos.map((repo) => (
          <div key={repo.id} className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <a href={repo.html_url}>{repo.name}</a>
                {repo.language && (
                  <Image
                    src={`https://skillicons.dev/icons?i=${repo.language.toLowerCase()}`}
                    alt={repo.language}
                    className="w-6 h-6 ml-2"
                  />
                )}
              </h2>
              {repo.description && <p>{repo.description}</p>}
              <p>
                Última atualização: {new Date(repo.updated_at).toLocaleString()}
              </p>
              <p>Último push: {new Date(repo.pushed_at).toLocaleString()}</p>
              <p>Criado em: {new Date(repo.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
