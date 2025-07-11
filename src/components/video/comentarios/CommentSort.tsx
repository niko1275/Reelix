import React from "react";

interface CommentSortProps {
  sortOption: string;
  onSortChange: (option: string) => void;
  totalComments: number;
}

const options = [
  { value: "top", label: "Top" },
  { value: "newest", label: "Newest" },
];

const CommentSort: React.FC<CommentSortProps> = ({ sortOption, onSortChange, totalComments }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-muted-foreground">{totalComments} Comments</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CommentSort;