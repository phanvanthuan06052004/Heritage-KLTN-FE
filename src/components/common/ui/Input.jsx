import { forwardRef } from "react";
import { cn } from "~/lib/utils";

const inputVariants = {
  variant: {
    default:
      "border-[color:var(--input)] bg-[color:var(--background)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--heritage-primary)] focus:border-[color:var(--heritage-primary)]",
    outline:
      "border-[color:var(--input)] bg-transparent focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)]",
    ghost: "border-none bg-transparent focus:ring-0 hover:bg-[color:var(--accent)]/10",
    destructive:
      "border-[color:var(--destructive)] bg-[color:var(--background)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--destructive)] focus:border-[color:var(--destructive)]",
    success:
      "border-[color:var(--success)] bg-[color:var(--background)] text-[color:var(--foreground)] focus:ring-2 focus:ring-[color:var(--success)] focus:border-[color:var(--success)]",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 py-2 text-sm",
    lg: "h-11 px-6 py-3 text-base",
    icon: "h-10 w-10 p-2",
  },
};

const Input = forwardRef(
  (
    { className, variant = "default", size = "default", error, "aria-label": ariaLabel, ...props },
    ref,
  ) => {
    const variantClasses =
      inputVariants.variant[error ? "destructive" : variant] ||
      inputVariants.variant.default;
    const sizeClasses = inputVariants.size[size] || inputVariants.size.default;

    return (
      <input
        ref={ref}
        className={cn(
          variantClasses,
          sizeClasses,
          "w-full rounded-md text-sm transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-[color:var(--muted-foreground)]",
          "focus-visible:outline-none",
          className,
        )}
        aria-invalid={error ? "true" : undefined}
        aria-label={ariaLabel}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
