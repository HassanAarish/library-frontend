# Changelog

All notable changes to the LibraryHub website and admin console. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
follow [semantic versioning](https://semver.org) (see CONTRIBUTING.md › Versions and releases).

## [Unreleased]

### Added
- Android App Links: the build writes `/.well-known/assetlinks.json` from
  `ANDROID_CERT_FINGERPRINTS`, so website links open the app; the offline service
  worker never answers `/.well-known` with the app page.
- Delete account: a section on the profile page (what still stops it, unused credits,
  password) and a public `/delete-account` help page, linked from the footer and the
  privacy policy. Signing in again within 14 days shows that the account is kept.

### Fixed
- Sign-in pages no longer scroll sideways on 360px phones (the Google button now fits
  its box).
- A wrong current password when changing it no longer signs you out.

## [0.1.0] - not yet released

The first version of the rebuilt website.

### Added
- **Design system ("warm editorial"):** light and dark themes, Fraunces and
  Inter, reusable components, a translation layer ready for Urdu (right to left).
- **Catalogue:** search, categories, sorting and book pages with live
  availability, queue position and booking dates.
- **Accounts:** sign-in flow with email codes, Google, Facebook and two-step
  verification, plus a profile page.
- **Renting and reading:** rent now or later, Easypaisa payment page with
  proof upload, reading plans, *My library* with countdowns, and the
  protected in-browser reader.
- **Community:** book requests with Open Library suggestions, follow,
  category suggestions and the notifications inbox.
- **Admin console:** dashboard, payments review and refunds, rentals, book
  editor with Open Library autofill, requests, categories, plans, users and
  activity logs.
- **Polish:** privacy policy, terms and contact pages, SEO tags and JSON-LD,
  icons and social previews, an accessibility pass (axe: 0 violations) and a
  Vitest suite.
- Every screen responsive at phone, tablet and desktop widths.

[Unreleased]: https://github.com/HassanAarish/library-frontend/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/HassanAarish/library-frontend/releases/tag/v0.1.0
