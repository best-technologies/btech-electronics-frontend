import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Link
        href="/"
        className="absolute left-6 top-6 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
