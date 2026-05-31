import React from "react";

const Skeleton = ({ className = "", variant = "rect" }) => {
  const base = "animate-pulse bg-gray-200 dark:bg-gray-700 overflow-hidden rounded";
  const shape =
    variant === "avatar"
      ? "h-10 w-10 rounded-full"
      : variant === "text"
      ? "h-4 w-full rounded-sm"
      : "h-40 w-full rounded-lg";

  return <div className={`${base} ${shape} ${className}`} aria-hidden="true" />;
};

export default Skeleton;
