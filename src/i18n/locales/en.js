/**
 * English UI text. Every string the UI shows comes from here (via `t()`), so
 * adding Urdu later means adding `ur.js` with the same keys, nothing else.
 * Placeholders: {name}. Plurals: { one, other } objects, chosen by {count}.
 */
const en = {
  app: {
    name: "LibraryHub",
    tagline: "Rent and read books online",
  },

  nav: {
    home: "Home",
    browse: "Browse books",
    requests: "Book requests",
    plans: "Plans",
    myLibrary: "My library",
    account: "Account",
    profile: "Profile",
    notifications: "Notifications",
    admin: "Admin",
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    menu: "Menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to content",
  },

  home: {
    eyebrow: "Online rental library",
    title: "Read the books you love, without buying every one.",
    subtitle:
      "Rent a book for two weeks, or pick a yearly plan of 3, 5 or 10 books. Read in your browser on any device.",
    searchPlaceholder: "Search by title or author",
    browse: "Browse the catalogue",
    howTitle: "How it works",
    step1Title: "Find a book",
    step1Body:
      "Browse the catalogue and see straight away whether a book is free or when it will be.",
    step2Title: "Book and pay",
    step2Body: "Book now or for a later date, and pay with Easypaisa. Plan credits cover any book.",
    step3Title: "Read online",
    step3Body:
      "Your book opens in the reader for the rental period. No downloads, nothing to install.",
    requestTitle: "Can't find a book?",
    requestBody:
      "Ask us to add it. If others want it too, it moves up the list, and we'll tell you when it arrives.",
    requestCta: "Request a book",
  },

  admin: {
    title: "Admin",
    dashboard: "Dashboard",
    books: "Books",
    payments: "Payments",
    rentals: "Rentals",
    packages: "Packages",
    requests: "Book requests",
    categories: "Categories",
    users: "Users",
    logs: "Activity logs",
    backToSite: "Back to site",
  },

  theme: {
    toggle: "Switch theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  notifications: {
    title: "Notifications",
    empty: "You're all caught up.",
    markAllRead: "Mark all as read",
    viewAll: "View all",
    unread: { one: "{count} unread notification", other: "{count} unread notifications" },
  },

  common: {
    loading: "Loading…",
    retry: "Try again",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    back: "Back",
    search: "Search",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
    comingSoon: "Coming soon",
    comingSoonBody: "This part of LibraryHub is being built ({phase}).",
    currency: "Rs {amount}",
  },

  errors: {
    title: "Something went wrong",
    body: "An unexpected error occurred. Reload the page, and if it keeps happening, contact support.",
    reload: "Reload page",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you're looking for doesn't exist or has moved.",
    goHome: "Go to the home page",
    offline: "You're offline. Some features won't work until you reconnect.",
    reference: "Reference: {id}",
  },

  account: {
    blocked: "Your account has been suspended. Please contact support.",
    sessionExpired: "Your session has expired. Please sign in again.",
  },

  footer: {
    about: "A rental library for readers in Pakistan.",
    rights: "© {year} LibraryHub. All rights reserved.",
    privacy: "Privacy policy",
    terms: "Terms",
    contact: "Contact",
  },
};

export default en;
