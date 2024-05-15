import Image from "next/image";
import React from "react";
import { FC } from "react";

interface RepoProps {
  id: number;
  name: string;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  pushed_at: string;
  created_at: string;
}

const RepoCard: FC<RepoProps> = ({
  id,
  name,
  html_url,
  description,
  language,
  updated_at,
  pushed_at,
  created_at,
}) => {
  return (
    <div key={id} className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <a href={html_url}>{name}</a>
          {language && (
            <Image
              src={`https://skillicons.dev/icons?i=${language.toLowerCase()}`}
              alt={language}
              className="w-6 h-6 ml-2"
            />
          )}
        </h2>
        {description && <p>{description}</p>}
        <p>Última atualização: {new Date(updated_at).toLocaleString()}</p>
        <p>Último push: {new Date(pushed_at).toLocaleString()}</p>
        <p>Criado em: {new Date(created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default RepoCard;
