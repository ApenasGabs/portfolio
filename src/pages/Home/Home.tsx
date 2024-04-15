import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, Flex, message, Tag } from "antd";

import { ReposProps } from "../../types";

import { StyledCardProps, StyledHomeContainer } from "./Home.styles";

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
        message.error(`${error}`);
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
      <Flex gap={4} wrap="wrap" align="center">
        <span>Categories:</span>
        {langs &&
          langs.map<React.ReactNode>((lang) => (
            <Tag.CheckableTag
              key={lang.language}
              checked={selectedTags.includes(lang.language)}
              onChange={(checked) => handleChange(lang.language, checked)}
            >
              {lang.language}
            </Tag.CheckableTag>
          ))}
      </Flex>
      <StyledHomeContainer ref={scrollContainerRef}>
        {filteredRepos &&
          filteredRepos.map((repo) => {
            return (
              <Card
                title={
                  <>
                    <a href={repo.html_url}>{repo.name}</a>
                    {repo.language && (
                      <img
                        src={`https://skillicons.dev/icons?i=${repo.language.toLowerCase()}`}
                        alt={repo.language}
                      />
                    )}
                  </>
                }
                bordered={false}
                style={StyledCardProps}
              >
                {repo.description && <p>{repo.description}</p>}
                <p>
                  Ultima atualização:
                  {new Date(repo.updated_at).toLocaleString()}
                </p>
                <p>Criado em: {new Date(repo.created_at).toLocaleString()}</p>
              </Card>
            );
          })}
      </StyledHomeContainer>
    </>
  );
};

export default Home;
