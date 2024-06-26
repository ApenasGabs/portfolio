import { ReposProps } from "../../types";
interface CardListProps {
  repoList: ReposProps[];
}
const CardList = ({ repoList }: CardListProps) => {
  return repoList.map((repo) => {
    const language = (repo.language ?? "").toLowerCase();
    console.log("language: ", language);

    const imgUrl = `https://skillicons.dev/icons?i=${language}`;
    if (!imgUrl) {
      return (
        <div className="card w-96 bg-primary  shadow-xl image-full">
          <figure>
            <img src={imgUrl} alt={repo.language} />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Projeto
              <a target="_blank" className="link" href={repo.html_url}>
                {repo.name}
              </a>
            </h2>
            <p>{repo.description}</p>
            <p>
              Ultima atualização:
              {new Date(repo.updated_at).toLocaleString()}
            </p>
            <p>
              Ultimo push:
              {new Date(repo.pushed_at).toLocaleString()}
            </p>
            Criado em: {new Date(repo.created_at).toLocaleString()}
            <div className="card-actions justify-end"></div>
          </div>
        </div>
      );
    }
    return (
      <div className="card w-96 bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">
            <img src={imgUrl} alt={repo.language} />
            <a target="_blank" href={repo.html_url}>
              {repo.name}
            </a>
          </h2>
          <p>{repo.description}</p>
          <p>
            Ultima atualização:
            {new Date(repo.updated_at).toLocaleString()}
          </p>
          <p>
            Ultimo push:
            {new Date(repo.pushed_at).toLocaleString()}
          </p>
          Criado em: {new Date(repo.created_at).toLocaleString()}
          <div className="card-actions justify-center">
            <button className="btn btn-active btn-neutral">
              <a target="_blank" href={repo.html_url}>
                See on GitHub
              </a>
            </button>
          </div>
        </div>
      </div>
    );
  });
};

export default CardList;
