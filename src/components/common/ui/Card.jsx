import PropTypes from "prop-types";
import { cn } from "~/lib/utils";

const Card = ({ children, className = '', tone = 'default', ...props }) => {
  const toneClasses = {
    default: 'bg-card text-card-foreground border border-border',
    muted: 'bg-muted text-muted-foreground border border-border/60',
  };

  return (
    <div
      className={cn('rounded-lg shadow-sm overflow-hidden', toneClasses[tone] || toneClasses.default, className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  tone: PropTypes.oneOf(["default", "muted"]),
};

export { Card };
