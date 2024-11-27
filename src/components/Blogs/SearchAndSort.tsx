import React, { useEffect, useState } from "react";

interface SearchAndSortProps {
  onSearch?: (searchTerm: string) => void; // Optional
  onSort: (sortBy: string) => void;
  sortOptions: Record<string, string>; // Map of human-readable names to values
  defaultSort?: string; // Optional default sort key
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  onSearch,
  onSort,
  sortOptions,
  defaultSort = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState(defaultSort);

  useEffect(() => {
    // Trigger default sort value on mount
    if (defaultSort && sortOptions[defaultSort]) {
      onSort(sortOptions[defaultSort]);
    }
  }, [defaultSort, sortOptions, onSort]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = event.target.value;
    setSelectedSort(selectedName);
    const sortBy = sortOptions[selectedName];
    onSort(sortBy); // Call the sort handler
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      {/* Conditionally render search input and button */}
      {onSearch && (
        <>
          <input
            type="text"
            placeholder="Search..."
            className="input input-bordered w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </>
      )}
      <select
        className="select select-bordered w-full max-w-xs"
        value={selectedSort}
        onChange={handleSortChange}
      >
        <option value="" disabled>
          Sort By
        </option>
        {Object.keys(sortOptions).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchAndSort;

