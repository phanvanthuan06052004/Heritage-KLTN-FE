import { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

import { setHeritagesSearchQuery } from "~/store/slices/paginationSlice";
import { selectHeritagesSearchQuery } from "~/store/selectors/paginationSelectors";
import useDebounce from "~/hooks/useDebounce";

const SearchBar = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectHeritagesSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();

  // Debounce search for better UX
  const debouncedSearch = useDebounce(searchValue, 300);

  const handleClear = useCallback(() => {
    setSearchValue("");
    dispatch(setHeritagesSearchQuery(""));
    inputRef.current?.focus();
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    if (searchValue !== searchQuery) {
      setIsSearching(true);
      dispatch(setHeritagesSearchQuery(searchValue));
      setTimeout(() => setIsSearching(false), 300);

      if (searchValue.trim() && location.pathname !== "/heritages") {
        navigate("/heritages");
      }
    }
  }, [searchValue, searchQuery, dispatch, navigate, location.pathname]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value.startsWith(" ")) {
      setSearchValue(value);
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        aria-label="Search heritage sites"
        placeholder="Search..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={searchValue}
        className={cn(
          "border border-input rounded-full bg-background",
          "w-[120px] sm:w-[180px] lg:w-[220px]",
          "pr-8 sm:pr-10 pl-4 py-2 text-sm",
          "focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none",
          "transition-all placeholder:text-muted-foreground",
        )}
      />
      {searchValue && (
        <button
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute top-1/2 right-9 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        aria-label="Search"
        onClick={handleSearch}
        className={cn(
          "absolute top-1/2 right-3 -translate-y-1/2",
          "text-muted-foreground hover:text-foreground transition-all",
        )}
      >
        {isSearching ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default SearchBar;
