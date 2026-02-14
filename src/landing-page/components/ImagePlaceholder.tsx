import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  /** Optional label shown in the placeholder (e.g. "Hero image") */
  label?: string;
  /** Aspect ratio as Tailwind class, e.g. "aspect-video", "aspect-square" */
  aspectRatio?: "video" | "square" | "4/3" | "3/4" | "auto";
  className?: string;
}

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  auto: "",
};

export function ImagePlaceholder({
  label,
  aspectRatio = "video",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm font-medium",
        aspectRatio !== "auto" && aspectClasses[aspectRatio],
        "w-full",
        className
      )}
      role="img"
      aria-label={label ?? "Image placeholder"}
    >
      {label ? (
        <span className="px-4 text-center">{label}</span>
      ) : (
        <span className="sr-only">Image placeholder</span>
      )}
    </div>
  );
}
