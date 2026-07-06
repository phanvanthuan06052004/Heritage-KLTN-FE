import { motion, useReducedMotion } from "framer-motion";

const MotionReveal = ({
  as: Component = "div",
  children,
  className,
  delay = 0,
  y = 34,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent = motion.create(Component);

  if (prefersReducedMotion) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.26, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default MotionReveal;
