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
    if (!searchQuery) setSearchValue('');
  }, [searchQuery]);

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
    <div className={cn("relative flex items-center", className)}>
      <input
        ref={inputRef}
        aria-label="Search heritage sites"
        placeholder={t("heritage.search")}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={searchValue}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className={cn(
          "h-11 rounded-full border border-museum-gold/20 bg-museum-black/60",
          "w-full min-w-0 sm:w-[200px] xl:w-[190px] 2xl:w-[250px]",
          "pr-16 pl-11 text-sm text-museum-ivory shadow-inner",
          "placeholder:text-museum-muted/80",
          "focus:border-museum-gold/60 focus:ring-2 focus:ring-museum-gold/20 focus:outline-none",
          "transition-all duration-300",
          "autofill:shadow-[inset_0_0_0px_1000px_#0B0A07] autofill:[-webkit-text-fill-color:#F7EFE2]",
        )}
      />
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-museum-gold-light/80" />
      {searchValue && (
        <button
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute top-1/2 right-12 -translate-y-1/2 text-museum-muted hover:text-museum-ivory transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        aria-label="Search"
        onClick={handleSearch}
        className={cn(
          "absolute top-1/2 right-3 -translate-y-1/2 z-10",
          "text-museum-muted hover:text-museum-gold-light transition-all",
        )}
      >
        {isSearching ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <>
            <Search className="h-4 w-4 sm:hidden" />
            <span className="hidden rounded-full border border-museum-gold/20 px-1.5 py-0.5 text-[0.62rem] font-semibold sm:inline bg-museum-black/40">
              Enter
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default SearchBar;
