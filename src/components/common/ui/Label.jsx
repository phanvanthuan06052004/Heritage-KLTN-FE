import { cn } from "~/lib/utils";

const Label = ({ children, className, required, ...props }) => (
  <label
    className={cn("block text-sm font-medium text-foreground", className)}
    {...props}
  >
    {children}
    {required && (
        <span className="ml-1 text-[color:var(--destructive)]" aria-hidden="true">
          *
        </span>
    )}
  </label>
);

export { Label };
