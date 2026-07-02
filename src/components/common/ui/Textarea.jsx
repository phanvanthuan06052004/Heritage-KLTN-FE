import { forwardRef, useState, useCallback } from "react";
import { cn } from "~/lib/utils";

const Textarea = forwardRef(
  (
    { className, maxLength, showCharCount = false, onChange, error, ...props },
    ref,
  ) => {
    const [charCount, setCharCount] = useState(0);

    const handleChange = useCallback(
      (e) => {
        const value = e.target.value;
        setCharCount(value.length);
        onChange?.(e);
      },
      [onChange],
    );

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm",
            "bg-[color:var(--background)] ring-offset-background",
            "placeholder:text-[color:var(--muted-foreground)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[color:var(--destructive)] focus-visible:ring-[color:var(--destructive)]"
              : "border-[color:var(--input)]",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />

        {/* Character count */}
        {showCharCount && maxLength && (
          <div
            className={cn(
              "absolute bottom-2 right-3 text-xs",
              charCount > maxLength * 0.9
                ? "text-[color:var(--destructive)]"
                : charCount > maxLength * 0.75
                  ? "text-[color:var(--warning)]"
                  : "text-[color:var(--muted-foreground)]",
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
