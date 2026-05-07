import { forwardRef } from "react";
import { cn } from "~/lib/utils";

const inputVariants = {
  variant: {
    default:
      "border-input bg-background text-foreground focus:ring-2 focus:ring-heritage focus:border-heritage",
    outline:
      "border-input bg-transparent focus:ring-2 focus:ring-accent focus:border-accent",
    ghost: "border-none bg-transparent focus:ring-0 hover:bg-accent/10",
    destructive:
      "border-destructive bg-background text-foreground focus:ring-2 focus:ring-destructive focus:border-destructive",
    success:
      "border-green-500 bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-green-500",
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
    { className, variant = "default", size = "default", error, ...props },
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
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none",
          className,
        )}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
