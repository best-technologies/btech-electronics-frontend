"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type AnimationVariant = "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";

type MotionTarget = { opacity?: number; x?: number; y?: number; scale?: number };
const variants: Record<
  AnimationVariant,
  { initial: MotionTarget; whileInView: MotionTarget; viewport?: { once?: boolean; margin?: string } }
> = {
  fadeUp: {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: "-50px" },
  },
  fadeIn: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: false, margin: "-80px" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, margin: "-60px" },
  },
  slideLeft: {
    initial: { opacity: 0, x: -48 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, margin: "-50px" },
  },
  slideRight: {
    initial: { opacity: 0, x: 48 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: false, margin: "-50px" },
  },
};

interface AnimateOnScrollProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate"> {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer";
}

const tagMap = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  footer: motion.footer,
} as const;

export function AnimateOnScroll({
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  children,
  className,
  as = "div",
  ...props
}: AnimateOnScrollProps) {
  const v = variants[variant];
  const MotionComponent = tagMap[as] ?? motion.div;

  return (
    <MotionComponent
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={v.viewport}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
