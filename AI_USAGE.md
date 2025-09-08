## used v0 and tinkering from my end to build FE ( due to time contraints)

### prompt used to build FE 

```Goal: Create a minimal, functional, and good-looking Next.js + TypeScript frontend (App Router) using shadcn/ui for UI primitives. The app calls http://localhost:5000/getProperties and exposes the backend filters: searchText, minTemp, maxTemp, minHumidity, maxHumidity, weatherCodes. Keep UI simple: top search, a left filter panel (collapsible on mobile), results list, loading skeletons, empty/error states. No map, no heavy extras.

High-level constraints & stack

Next.js App Router (use app/ directory).

TypeScript with strict: true.

shadcn/ui primitives for forms, inputs, buttons, dropdowns, cards, skeletons. Use Tailwind (shadcn expects it).

api with axios

Env var: NEXT_PUBLIC_API_BASE_URL (default http://localhost:5000).


Request to:

GET ${NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/getProperties?[params]


Only include defined params.

Supported query params (frontend must send exactly these names):

searchText — string

minTemp — number (°C)

maxTemp — number (°C)

minHumidity — number (%)

maxHumidity — number (%)

weatherCodes — CSV of integers (e.g. 0,61) —

Example:

/getProperties?searchText=Chennai&minTemp=24&maxTemp=34&minHumidity=50&maxHumidity=90&weatherCodes=0,61&page=1&pageSize=20


Expected response shape (typed):

{
  data: Property[],
  meta?: { total?: number, page?: number, pageSize?: number, totalPages?: number }
}


Front-end must tolerate missing fields safely.

Minimal UX & components (what to build)

Pages:

app/(main)/page.tsx — main search + results view.

app/layout.tsx — root layout with QueryClientProvider.

Components (small, reusable):

ui/Topbar.tsx — title + search input.

ui/FiltersPanel.tsx — collapsible vertical panel with:

Dual-range for temperature (slider + numeric inputs).

Dual-range for humidity (slider + numeric inputs).

WeatherCodes multi-select: checkboxes for common codes + a small free-text CSV input for advanced users.

Apply and Reset buttons.

ui/PropertyCard.tsx — simple card: name, city/state, tags, temperature (°C), humidity (%), weather code, last fetched time or “weather unavailable”.

ui/ResultsList.tsx — shows summary, sort select (minimal), a grid/list of PropertyCard, skeletons, empty state, error UI with retry.

fetch with simple axios api on client side itself

Design / behavior:

Two-column layout on desktop (filters left, results right). On mobile, filters collapse above results.

Minimal tasteful spacing and subtle shadows using shadcn/Tailwind.

keep everything on client side
```