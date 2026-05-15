import { cn } from "~/lib/utils";

const MuseumSectionHeader = ({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}) => {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-8 sm:mb-12",
        centered && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-4 py-1.5 text-xs font-semibold uppercase text-museum-gold-light">
          <span className="h-1.5 w-1.5 rounded-full bg-museum-gold-light" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-semibold leading-tight text-museum-ivory sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-sm leading-7 text-museum-muted sm:text-base",
            centered ? "mx-auto max-w-2xl" : "max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default MuseumSectionHeader;
