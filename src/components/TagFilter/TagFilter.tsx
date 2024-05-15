import React from "react";
import { FC } from "react";

interface UserLangs {
  language: string;
  quantity: number;
}

interface TagFilterProps {
  langs: UserLangs[];
  selectedTags: string[];
  handleChange: (tag: string, checked: boolean) => void;
}

const TagFilter: FC<TagFilterProps> = ({
  langs,
  selectedTags,
  handleChange,
}) => {
  return (
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
  );
};

export default TagFilter;
