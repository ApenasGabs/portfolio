import { ReactNode, useEffect, useRef, useState } from "react";
import axios from "axios";

import { ReposProps } from "../../types";
import Modal from "../../components/Modal/Modal";
import CardList from "../../components/CardList/CardList";

interface UserLangs {
  language: string;
  quantity: number;
}

const Home = () => {
  const [repos, setRepos] = useState<ReposProps[]>();
  const [langs, setLangs] = useState<UserLangs[]>();
  const [filteredRepos, setFilteredRepos] = useState<ReposProps[]>([]);
  const baseUrl = "https://api.github.com/users/apenasgabs/repos";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleChange = (tag: string) => {
    const nextSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
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
      <Modal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen((prev) => !prev)}
      />
      <div className="p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <span>Categories:</span>
          {langs &&
            langs.map<ReactNode>((lang) => (
              <div
                key={lang.language}
                className={`badge cursor-pointer ${
                  selectedTags.includes(lang.language)
                    ? "badge-primary"
                    : "badge-secondary"
                }`}
                onClick={() => handleChange(lang.language)}
              >
                {lang.language}
              </div>
            ))}
        </div>
      </div>
      <div className="overflow-x-auto p-4" ref={scrollContainerRef}>
        {filteredRepos && <CardList repoList={filteredRepos} />}
      </div>
    </>
  );
};

export default Home;
