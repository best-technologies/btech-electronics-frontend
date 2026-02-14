# Electronics

A [Next.js](https://nextjs.org) project with [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) components.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (New York style, neutral theme)
- **ESLint**

## Getting Started

Install dependencies (if needed) and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding shadcn Components

Components are configured in `components.json`. Add new UI components with:

```bash
npx shadcn@latest add [component-name]
```

Examples: `npx shadcn@latest add input`, `npx shadcn@latest add dialog`, `npx shadcn@latest add dropdown-menu`.

Pre-installed: **Button**, **Card**. Use `@/components/ui/button` and `@/components/ui/card`.

## Project Structure

- `src/app/` — App Router pages and layouts
- `src/components/ui/` — shadcn UI components
- `src/lib/utils.ts` — `cn()` utility for class names
- `src/app/globals.css` — Tailwind and theme (CSS variables for light/dark)

## Scripts

| Command   | Description        |
| --------- | ------------------ |
| `npm run dev`   | Start dev server (Turbopack) |
| `npm run build` | Production build   |
| `npm run start` | Start production server |
| `npm run lint`  | Run ESLint         |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
