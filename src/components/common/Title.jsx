import { cn } from "~/lib/utils";

const Title = ({ icon: Icon, title, subtitle, className }) => {
  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-3">
        {Icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-heritage-light">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-heritage" />
          </div>
        )}
        <div>
          <h2
            className={cn(
              "text-2xl sm:text-3xl text-heritage-dark font-semibold tracking-tight",
              className,
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Title;
