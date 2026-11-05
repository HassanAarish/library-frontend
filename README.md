# 📚 LibraryHub — Frontend

The reader-facing website and admin console for **LibraryHub**, an online
book-rental library launching in Pakistan. Visitors browse the catalogue; readers
rent books (single rental or 3/5/10-book yearly plans), pay with Easypaisa and read
in the browser; the admin runs the catalogue, payments and requests.

This is the SPA half of a two-part app. The Express/MongoDB API (REST + Socket.IO)
lives in `../library-backend`; its README documents every endpoint and event.

> **Status:** the frontend is being rebuilt in phases. **F0 (foundation) is done**:
> design system, API layer, live updates, routing and layouts. Screens arrive in
> F1 catalogue → F2 accounts → F3 renting & reader → F4 community & inbox →
> F5 admin → F6 polish. Routes not built yet show a "coming soon" page naming
> their phase.

---

## 🧰 Tech stack

| Area | Technology |
|------|-----------|
| Framework | **React 19** |
| Build | **Vite 8** + PWA (`vite-plugin-pwa`) |
| Styling | **Tailwind CSS 4**: "warm editorial" design system, light + dark |
| Data | **TanStack React Query** + **Axios** |
| Live updates | **socket.io-client** |
| Routing | **react-router-dom 7** |
| Forms | Formik + Yup |
| Social login | `@react-oauth/google` + Facebook JS SDK |
| Toasts | react-toastify |
| Tooling | ESLint 10 (flat config) + Prettier |

---

## 🎨 Design system ("warm editorial")

A calm bookstore look: warm paper backgrounds, an editorial serif (**Fraunces**)
for headings, **Inter** for UI text, deep ink-green as the brand colour, gold as
the accent, and book covers as the main visual.

- **Tokens** live in `src/index.css` as CSS variables that switch with
  `[data-theme="dark"]`, exposed to Tailwind as `bg-canvas`, `bg-surface`,
  `bg-sunken`, `text-fg`, `text-fg-muted`, `border-line`, `bg-brand`,
  `text-gold`, `bg-success-soft`, … Never hard-code colours; use the tokens so
  both themes work.
- **Theme**: light / dark / system (`ThemeContext`), applied before first paint
  by a tiny script in `index.html`, so there's no flash.
- **Components** in `src/ui/`, imported from `@/ui`: `Button`, `IconButton`,
  `Field` + `Input`/`Textarea`/`Select`, `Card`, `Badge`, `Avatar`, `Modal`
  (native `<dialog>`), `Popover`/`MenuItem`, `BookCover` (with typeset fallback
  covers), `Skeleton`, `EmptyState`, `ErrorState`, `Alert`, `Container`,
  `PageHeader`, `Pagination`.
- **Gallery**: run `npm run dev` and open **`/dev/design`** to see every
  component in both themes. The page exists only in development builds.
- **RTL-ready**: layouts use logical utilities (`ms-`/`me-`, `ps-`/`pe-`,
  `start-`/`end-`, `text-start`), and directional icons flip with `rtl:rotate-180`.

---

## 🌐 Text & languages

All UI text goes through `t()` from `src/i18n` (strings in
`src/i18n/locales/en.js`). English ships today. **To add Urdu**, create
`locales/ur.js` with the same keys and enable it in `LOCALES`. The provider sets
`<html lang dir="rtl">`, and the layout mirrors on its own. Dates, numbers and
prices (`price(1400)` → "Rs 1,400") use the `Intl` formatters from `useI18n()`,
in Pakistan time.

---

## 🏛️ Architecture

### Provider tree
```
I18n → Theme → ErrorBoundary → GoogleOAuth → ReactQuery → Router → Auth → Socket → Modal → Routes
```

### API layer (`src/lib/`)
- `lib/http.js`: one Axios instance. It adds the `Bearer` token and turns every
  failure into an **`ApiError`** `{ message, status, requestId }`. The message
  comes from the backend's `error` field, and the request id matches the
  backend's activity log. A 401 on a signed-in session signs the user out.
- `lib/api/index.js`: **one function per backend endpoint**, grouped by area:
  `auth`, `twoFactor`, `user`, `files`, `books`, `categories`, `rentals`,
  `reader`, `payments`, `packages`, `reviews`, `bookRequests`, `notifications`,
  `admin`. Each returns the response's `data`.
- `lib/queryClient.js`: React Query defaults plus **`qk`**, the single list of
  cache keys.

### Live updates (`src/realtime/SocketProvider.jsx`)
There is one socket per tab. It's anonymous for visitors and reconnects with
the token after sign-in. Server events become cache refreshes:
- `notification:new`: shows a toast and refreshes the inbox and the area it's
  about (payments, rentals, …).
- `notification:read`: syncs the unread count across tabs.
- `book:availability`: refetches that book's queue and availability. Book pages
  call `useWatchBook(bookId)`.
- `account:blocked` and refused tokens: sign the user out.

### Routing (`src/routes/`)
| Area | Paths | Guard |
|------|-------|-------|
| Public | `/`, `/books`, `/books/:id`, `/requests`, `/plans`, `/privacy`, … | none |
| Sign-in flow | `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password/:token`, `/two-factor` | `GuestOnly` |
| Reader | `/account/*`, `/read/:bookId` | `RequireAuth` |
| Admin console | `/admin/*` | `RequireAuth role="admin"` |

The guards only keep people on screens they can use. The backend enforces
every rule itself.

### Layouts (`src/layout/`)
- `PublicLayout`: sticky header (nav, theme toggle, notification bell,
  account menu), page and footer.
- `AdminLayout`: sidebar (a drawer on small screens) and top bar.
- `LegacyScreen`: a temporary dark backdrop for the old profile screen.

### Legacy code (removed in F2)
The sign-in screens, the profile page, `src/api/` (old client), `src/components/`
and `src/styles/legacy.css` are the previous "Aurora Glass" UI. They still work
and are rebuilt in F2. New code must not import them.

---

## 📂 Project structure

```
library-fronend/
├── src/
│   ├── ui/            design system components (import from "@/ui")
│   ├── lib/           http client, API functions, React Query client + keys
│   ├── realtime/      Socket.IO provider + useWatchBook
│   ├── i18n/          t(), formatters, locales/en.js
│   ├── context/       AuthContext, ThemeContext, ModalContext (legacy)
│   ├── routes/        AppRoutes, guards, ScrollToTop
│   ├── layout/        PublicLayout, AdminLayout, LegacyScreen
│   ├── components/
│   │   └── shell/     Logo, SiteHeader, SiteFooter, NotificationBell, UserMenu, ThemeToggle, OfflineBanner
│   ├── hooks/         useNotifications, useUpload (legacy)
│   ├── pages/         Home, system/ (404, error, loader, coming soon, /dev/design), Auth/* + Profile (legacy)
│   ├── constants/     API/socket URLs, social client ids
│   ├── App.jsx        provider tree
│   └── index.css      design tokens + base styles
```

---

## ⚙️ Environment variables

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=http://localhost:5001        # backend (REST + Socket.IO)
# VITE_SOCKET_URL=http://localhost:5001   # only if sockets live elsewhere
VITE_GOOGLE_CLIENT_ID=<google client id>.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=<facebook app id>
```

> Only `VITE_*` values reach the browser, and they're public by design. The
> Google/Facebook *secrets* stay in the backend. Restart the dev server after
> changing `.env`.

---

## 🚀 Getting started

```bash
cd library-fronend
npm install
cp .env.example .env
npm run dev        # http://localhost:5173 (backend on :5001)
```

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier write / check |
