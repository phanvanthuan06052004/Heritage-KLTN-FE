import PropTypes from "prop-types";
import { cn } from "~/lib/utils";

const skeletonVariants = {
  avatar: "h-10 w-10 rounded-full",
  text: "h-4 w-full rounded-sm",
  rect: "h-40 w-full rounded-lg",
};

const Skeleton = ({ className = "", variant = "rect" }) => {
  const base = "animate-pulse bg-gray-200 dark:bg-gray-700 overflow-hidden rounded";
  const shape = skeletonVariants[variant] || skeletonVariants.rect;

  return <div className={cn(base, shape, className)} aria-hidden="true" />;
};

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["avatar", "text", "rect"]),
};

export { Skeleton, skeletonVariants };
