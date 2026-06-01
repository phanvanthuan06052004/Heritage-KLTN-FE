import { useRef, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

import { setHeritagesSearchQuery } from "~/store/slices/paginationSlice";
import { selectHeritagesSearchQuery } from "~/store/selectors/paginationSelectors";

const SearchBar = ({ className }) => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectHeritagesSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSearchValue(searchQuery || "");
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setSearchValue("");
    dispatch(setHeritagesSearchQuery(""));
    inputRef.current?.focus();
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    const nextQuery = searchValue.trim();

    if (nextQuery !== searchQuery) {
      setIsSearching(true);
      dispatch(setHeritagesSearchQuery(nextQuery));
      setTimeout(() => setIsSearching(false), 300);

      if (nextQuery && location.pathname !== "/heritages") {
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
    <form
      className={cn(
        "group flex h-11 w-full min-w-0 items-center rounded-full border border-museum-gold/20 bg-museum-black/45 p-1 text-museum-ivory shadow-[inset_0_1px_0_rgba(247,239,226,0.08)] transition-colors duration-200 focus-within:border-museum-gold/65 focus-within:bg-museum-black/72 focus-within:ring-2 focus-within:ring-museum-gold/18 md:w-[260px] lg:w-[330px]",
        className,
      )}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
    >
      <label className="sr-only" htmlFor="header-heritage-search">
        Search heritage sites
      </label>
      <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center text-museum-gold-light/80 transition-colors group-focus-within:text-museum-gold-light">
        <Search className="h-4 w-4" aria-hidden="true" />
      </span>
      <input
        id="header-heritage-search"
        ref={inputRef}
        placeholder={t("heritage.search")}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={searchValue}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-museum-ivory outline-none placeholder:text-museum-muted/75"
      />
      {searchValue && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-museum-muted transition-colors hover:bg-museum-ivory/10 hover:text-museum-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        type="submit"
        aria-label="Search"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-museum-gold text-museum-black transition-colors hover:bg-museum-gold-light disabled:cursor-wait disabled:opacity-70",
          !searchValue && "bg-museum-ivory/10 text-museum-muted hover:bg-museum-ivory/14 hover:text-museum-ivory",
        )}
        disabled={isSearching}
      >
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </button>
    </form>
  );
};

export default SearchBar;
