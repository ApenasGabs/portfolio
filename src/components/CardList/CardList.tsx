import { ReposProps } from "../../types";
interface CardListProps {
  repoList: ReposProps[];
}
const CardList = ({ repoList }: CardListProps) => {
  return repoList.map((repo) => {
    const language = repo.language ?? "";
    const imgUrl = `https://skillicons.dev/icons?i=${language}`;
    if (imgUrl) {
      return (
        <div className="card w-96 bg-base-100 shadow-xl image-full">
          <figure>
            <img src={imgUrl} alt={repo.language} />
          </figure>
          <div className="card-body">
            <p>
              Ultima atualização:
              {new Date(repo.updated_at).toLocaleString()}
            </p>
            <p>
              Ultimo push:
              {new Date(repo.pushed_at).toLocaleString()}
            </p>
            <h2 className="card-title">
              Criado em: {new Date(repo.created_at).toLocaleString()}
            </h2>
            <p>{repo.description}</p>{" "}
            <div className="card-actions justify-end">
              <button className="btn btn-primary">
                <a href={repo.html_url}>{repo.name}</a>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="card w-96 bg-primary text-primary-content">
        <div className="card-body">
          <h2 className="card-title">Card title!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn">Buy Now</button>
          </div>
        </div>
      </div>
    );
  });
};

export default CardList;
