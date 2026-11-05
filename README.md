# 📚 LibraryHub — Frontend

The reader-facing website and admin console for **LibraryHub**, an online
book-rental library launching in Pakistan. Visitors browse the catalogue; readers
rent books (single rental or 3/5/10-book yearly plans), pay with Easypaisa and read
in the browser; the admin runs the catalogue, payments and requests.

This is the SPA half of a two-part app. The Express/MongoDB API (REST + Socket.IO)
lives in `../library-backend`; its README documents every endpoint and event.

> **Status:** the frontend is being rebuilt in phases. **Done:** F0 (design
> system, API layer, live updates, routing, layouts), F1 (catalogue and book
> page with live availability), F2 (sign-in flow, profile, responsive pass,
> old UI removed), F3 (renting, Easypaisa payments, plans, library, reader) and
> F4 (book requests, category suggestions, notifications inbox). **Next:**
> F5 admin → F6 polish. Routes not built yet show a "coming soon" page naming
> their phase.

## 🙋 Community & inbox (F4)

| Screen | Route | What it does |
|--------|-------|--------------|
| Book requests | `/requests` | Public list of wanted books (search, status, most wanted / newest), "I want this too" to follow, the admin's latest note. **Request a book** opens a form with Open Library suggestions as you type (picking one fills title, author, ISBN, language). If the book is already in the library, it offers the book instead; duplicates join the existing request. Side card: suggest a category |
| Request | `/requests/:id` | Status, follower count, admin note, a timeline of every status change, and follow, or "Rent it now" once added |
| My requests | `/account/requests` | Requests I asked for or follow, plus my category suggestions with the admin's note |
| Notifications | `/account/notifications` | Full inbox (all / unread), click to open the page it's about (`lib/notificationLink.js`), mark read, mark all read, delete. The header bell's items open their page too |

Visitors get "Sign in to …" buttons that bring them back, with the request
form open when that's what they asked for. On phones the account tabs scroll
sideways and the current tab is scrolled into view.

## 📚 Renting & reading (F3)

| Screen | Route | What it does |
|--------|-------|--------------|
| Rent a book | `/books/:id/rent` | Start as soon as it's free or on a chosen day (up to 60 days ahead); pay once or with a plan credit (preselected when the reader has credits); free books need no payment |
| Payment | `/account/payments/:id` | Easypaisa account, amount and reference with copy buttons, the hold countdown, then the proof form (TID, sender number, private receipt screenshot). Then under review / confirmed / not confirmed, updated live |
| Payments | `/account/payments` | Every payment with status and refund state |
| Plans | `/plans` | The 3/5/10-book yearly plans with price per book and "best value"; buying one goes to its payment page; a pending purchase can be continued |
| My library | `/account` | Plan credits, then **Reading now** (read, extend 7 days, return), **Upcoming** (pay, view payment, start now, cancel) and **History**; cancelling explains the credit or refund outcome |
| Reader | `/read/:bookId` | Full-screen, page by page: arrows/keys, page number box, zoom, the next page loaded in advance, last page remembered. No-access screen outside the rental period |

The account tabs (My library, Payments, Profile) share one frame
(`components/account/AccountPage`): the same width, header and tab bar.

**Reader protection (on top of the server's per-reader watermark):** pages
arrive as image data with no file to download. Right-click, dragging, copying,
text selection, long-press save and printing (including Ctrl/⌘+P and S) are
blocked. Only one page is fetched ahead, which keeps normal reading well under
the server's limit of 40 pages a minute, and "too fast" is explained if it's
hit.

## 🔐 Accounts (F2)

| Screen | Route | Notes |
|--------|-------|-------|
| Sign in | `/login` | Email + password, Google, Facebook. 2FA → `/two-factor`; an unverified email → `/verify-otp`, where a new code can be sent straight away |
| Create account | `/signup` | Password rule matches the backend (8+ characters, a letter and a number), then email verification |
| Verify email | `/verify-otp` | 6-digit code, with a 60 s cooldown on "send a new code" |
| Forgot / reset password | `/forgot-password`, `/reset-password/:token` | The reset link comes from the email |
| Two-step code | `/two-factor` | Only reachable right after the first step |
| Profile & settings | `/account/profile` | Photo, personal details, notification switches, password change, 2FA on/off with a QR code, connected Google/Facebook accounts |

- After signing in, people return to the page they came from (e.g. a book's
  "Sign in to rent"), otherwise to `/account` (readers) or `/admin` (admin).
- If Google and Facebook both share an email with an existing account, the
  app asks before linking them.
- Changing the password signs you out everywhere, including the current tab.
- The Google button only renders on origins listed in the Google OAuth client
  (e.g. `http://localhost:5173`).

## 📱 Responsive

Every screen is built mobile-first and checked at **360px (phone), 768px
(tablet) and 1366px (desktop)**, including a check that nothing makes the page
scroll sideways. Patterns:

- The site header collapses to a menu below `md`. On phones the theme switch
  moves into that menu, so the bar fits a 360px screen when signed in.
- The admin sidebar becomes a drawer below `lg`.
- The sign-in brand panel shows from `lg` up; on phones it's the form only.
- Forms and grids drop to one column (`sm:grid-cols-2`, `lg:grid-cols-[…]`),
  and the catalogue grid goes from 5 columns down to 2.
- Decorative elements that could poke out of their section are clipped
  (`overflow-hidden`).

## 📖 Catalogue (F1)

- **`/books`**: search (title or author), category, language and sort, with
  pagination. Every filter lives in the URL, so a filtered view can be shared
  or bookmarked and Back works. Typing is debounced, and the previous results
  stay visible while the next page loads.
- **`/books/:bookId`**: cover, details, price per rental and plan-credit note,
  plus the **live availability panel**: free now, or rented until X, next free
  date, people ahead, queue length and booked periods. Signed-in readers also
  see their own booking and place in line. It refreshes the moment anyone
  books, cancels or returns the book (socket room `book:<id>`).
- The home page shows **New in the library** from the catalogue.
- Categories come from the public `GET /category`. Book details for autofill
  come from `lookup.*` (Open Library via the backend), used in F4/F5.

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
  `inset-s-`/`inset-e-`, `text-start`), and directional icons flip with
  `rtl:rotate-180`.
- **Tailwind lint rules** (`eslint-plugin-better-tailwindcss`, in
  `eslint.config.js`) make `npm run lint` fail on:
  - non-canonical classes (e.g. `bg-gradient-to-b` → `bg-linear-to-b`,
    `w-4 h-4` → `size-4`);
  - deprecated, unknown, conflicting or duplicate classes, and stray whitespace;
  - left/right classes that should be logical (`ml-` → `ms-`, `left-` →
    `inset-s-`, …), so the layout mirrors for Urdu.

  Most of these fix themselves with `npm run lint:fix`, or with ESLint
  fix-on-save in VS Code (`"editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }`).
  Custom classes must be declared with `@utility` in `index.css` so Tailwind
  knows them.

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
- `AuthLayout`: the sign-in flow (brand panel + form), with `AuthHeader` /
  `AuthFooter` helpers.

---

## 📂 Project structure

```
library-fronend/
├── src/
│   ├── ui/            design system components (import from "@/ui")
│   ├── lib/           http client, API functions, React Query client + keys
│   ├── realtime/      Socket.IO provider + useWatchBook
│   ├── i18n/          t(), formatters, locales/en.js
│   ├── context/       AuthContext, ThemeContext
│   ├── routes/        AppRoutes, guards, ScrollToTop
│   ├── layout/        PublicLayout, AdminLayout, AuthLayout
│   ├── components/
│   │   ├── shell/     Logo, SiteHeader, SiteFooter, NotificationBell, UserMenu, ThemeToggle, OfflineBanner
│   │   ├── books/     BookCard + BookGrid, AvailabilityPanel
│   │   └── auth/      SocialButtons (Google, Facebook, link prompt)
│   ├── hooks/         useBooks (catalogue, book, categories, live availability), useNotifications
│   ├── pages/         Home, Catalog, BookDetail, Auth/ (sign-in flow + form rules), Profile/, system/ (404, error, loader, coming soon, /dev/design)
│   ├── utils/         facebook (SDK loader)
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
