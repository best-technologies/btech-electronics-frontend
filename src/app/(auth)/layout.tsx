import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/btech-logo.jpg"
            alt="Best Technologies"
            fill
            className="object-contain"
            sizes="32px"
          />
        </span>
        <span>← Back to home</span>
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
