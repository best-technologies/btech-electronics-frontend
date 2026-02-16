# Real map in "Who we are"

The map section shows a **Google Maps embed**. No API key is required.

## What you need to do

### 1. Get the embed URL from Google Maps

1. Open [Google Maps](https://www.google.com/maps).
2. Search for your business or exact address (e.g. **Best Technologies Electronics, Ibadan**).
3. Click **Share**.
4. Open the **Embed a map** tab.
5. Click **Copy HTML**. You will get a full iframe tag like:

```html
<iframe src="https://www.google.com/maps/embed?pb=..." width="600" ...></iframe>
```

**Important:** In `.env` you must use **only the URL** from inside `src="..."` — do **not** paste the whole iframe or the quotes. Copy only the part that starts with `https://www.google.com/maps/embed?pb=` and ends before the next `"` (before `width=`).

### 2. Add it to your environment

In your project root, create or edit `.env` and add:

```env
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=https://www.google.com/maps/embed?pb=YOUR_COPIED_URL_HERE
```

Replace `YOUR_COPIED_URL_HERE` with the full embed URL you copied (the whole `https://www.google.com/maps/embed?pb=...` string).

### 3. Restart the dev server

Restart `npm run dev` so Next.js picks up the new env variable. The map will then appear in the "Who we are" section.

---

## Optional: OpenStreetMap / Leaflet

If you prefer not to use Google (e.g. no account, or custom styling), we can switch to **OpenStreetMap** with Leaflet. You would only need to provide:

- **Latitude and longitude** of your location (e.g. from Google Maps: right‑click on the pin → click the coordinates to copy).

No API key is required for basic OSM tiles.
