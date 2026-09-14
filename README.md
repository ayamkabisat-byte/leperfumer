# Le Parfumeur

Olfactory composition studio built with Next.js, Supabase, and Gemini. Compose fragrance pyramids from a large note database, lock ingredients, request a structured AI critique, generate a visual moodboard prompt, and archive finished concepts.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Supabase Database + Storage
- Google Gemini API (default: `gemini-3.8-flash`)

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash
GALLERY_UPLOAD_TOKEN=use-a-long-random-secret
```

`SUPABASE_SERVICE_KEY` and `GALLERY_UPLOAD_TOKEN` are server-only secrets. Never expose them with a `NEXT_PUBLIC_` prefix.

The browser Settings page can optionally store a personal Gemini key (BYOK) and the gallery upload token in localStorage. Leave the Gemini field empty to use the server key.

## Supabase

Expected storage bucket: `perfume-images`.

Expected `perfumes` columns:

- `id`
- `name`
- `top_notes`
- `mid_notes`
- `base_notes`
- `image_url`
- `created_at`

The gallery reads through the anon client, so configure RLS to allow only the public read behavior you actually want. Gallery writes go through the server route and require `GALLERY_UPLOAD_TOKEN` in production.

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Before deployment:

```bash
npm run lint
npm run build
```

## AI contract

The AI route returns structured JSON rather than model-generated HTML. This keeps the UI predictable and avoids rendering AI output with `dangerouslySetInnerHTML`. Supported UI-selectable models are `gemini-3.8-flash`, `gemini-3.7-flash`, and `gemini-3.6-flash`.
