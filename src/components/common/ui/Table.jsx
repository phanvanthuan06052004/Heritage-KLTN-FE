import { cn } from "~/lib/utils";

const Table = ({ children, className }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-border">
    <table className={cn("w-full border-collapse", className)}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, className }) => (
  <thead className={cn("bg-muted", className)}>{children}</thead>
);

const TableBody = ({ children }) => <tbody>{children}</tbody>;

const TableRow = ({ children, className, onClick, hoverable = true }) => (
  <tr
    className={cn(
      "border-b border-border transition-colors",
      hoverable && "hover:bg-accent/50",
      onClick && "cursor-pointer",
      className,
    )}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick(e);
            }
          }
        : undefined
    }
    role={onClick ? "button" : undefined}
  >
    {children}
  </tr>
);

const TableHead = ({
  children,
  className,
  sortable,
  sortDirection,
  onSort,
}) => (
  <th
    className={cn(
      "px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap",
      className,
    )}
    scope="col"
    aria-sort={
      sortable
        ? sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none"
        : undefined
    }
  >
    {sortable ? (
      <button
        className="inline-flex items-center gap-1 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={onSort}
        aria-label={`Sort by ${children}${sortDirection === "asc" ? ", ascending" : sortDirection === "desc" ? ", descending" : ""}`}
      >
        {children}
        {sortDirection && (
          <span className="text-xs" aria-hidden="true">
            {sortDirection === "asc"
              ? " ▲"
              : sortDirection === "desc"
                ? " ▼"
                : ""}
          </span>
        )}
      </button>
    ) : (
      children
    )}
  </th>
);

const TableCell = ({ children, className, maxWidth = "none", ...props }) => (
  <td
    className={cn("px-4 py-3 text-sm", className)}
    style={{ maxWidth }}
    {...props}
  >
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
