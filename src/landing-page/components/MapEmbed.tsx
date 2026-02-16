"use client";

const rawMapEmbed = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "";
const MAP_EMBED_URL = (() => {
  const s = rawMapEmbed.trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  const match = s.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : s;
})();
const MAP_SEARCH_QUERY = "Best+Technologies+Electronics+Ibadan+Oyo+Nigeria";

export function MapEmbed() {
  if (MAP_EMBED_URL) {
    return (
      <div className="relative aspect-video w-full">
        <iframe
          src={MAP_EMBED_URL}
          title="Our location on Google Maps"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 bg-muted/30 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Set <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL</code> in <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.env</code> to show your map.
      </p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${MAP_SEARCH_QUERY}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-primary hover:underline"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}
