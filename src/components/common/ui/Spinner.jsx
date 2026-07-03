import PropTypes from "prop-types";
import { cn } from "~/lib/utils";

const sizeVariants = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-4",
  xl: "h-12 w-12 border-4",
};

const Spinner = ({ size = "lg", className, ...props }) => {
  return (
    <div
      className={cn("flex justify-center items-center", className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div
        className={cn(
          sizeVariants[size] || sizeVariants.lg,
          "animate-spin rounded-full border-gray-200 border-t-primary border-solid",
        )}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};

export { Spinner, sizeVariants as spinnerVariants };
