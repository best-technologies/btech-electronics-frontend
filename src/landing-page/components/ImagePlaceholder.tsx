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
        "relative flex items-center justify-center overflow-hidden bg-muted/90 text-muted-foreground",
        aspectRatio !== "auto" && aspectClasses[aspectRatio],
        "w-full",
        className
      )}
      role="img"
      aria-label={label ?? "Image placeholder"}
    >
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      {label ? (
        <span className="relative px-4 text-center text-sm font-medium">
          {label}
        </span>
      ) : (
        <span className="sr-only">Image placeholder</span>
      )}
    </div>
  );
}
