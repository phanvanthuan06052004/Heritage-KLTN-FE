import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-[color:var(--heritage-primary)] text-[color:var(--primary-foreground)] hover:opacity-95",
    destructive:
      "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:opacity-90",
    outline:
      "border border-[color:var(--input)] bg-[color:var(--card)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]",
    ghost: "bg-transparent hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]",
    link: "bg-transparent text-[color:var(--heritage-primary)] underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

const Button = forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const variantClasses =
      buttonVariants.variant[variant] || buttonVariants.variant.default;
    const sizeClasses =
      buttonVariants.size[size] || buttonVariants.size.default;

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses,
          sizeClasses,
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
