# Changelog

All notable changes to this project are documented in this file.
This changelog was compiled from the Git commit history on branch `dev`.

## 2026-03-24 to 2026-03-20

### Added

- Added JWT utility unit tests covering signing, verification, and error paths.
- Added helper utilities for standardized API error responses.
- Added a reusable authenticated API handler to centralize auth and response behavior.
- Added and adopted `findAddressByComponents` utility for address reuse and lookup consistency.

### Changed

- Improved voter ID photo flow to respect contest-group voter ID requirements.
- Enhanced reactive search/user-role handling using derived state patterns.
- Refactored shared domain types (address, user role, contest, contest results) for stronger consistency.

### Fixed

- Fixed polling-station handler input normalization mismatch with array validators.
- Fixed validator/DB write flow to trim name whitespace and persist parsed values.
- Removed noisy/non-actionable voter ID upload warnings when ID requirements are disabled.
- Applied linting and cleanup fixes.

## 2026-03-19 to 2026-03-01

### Added

- Added voter ID photo upload schema, storage integration, and admin display support.
- Added first/last name metadata to voter ID upload validation.
- Added batch contest-group creation UI/actions and JSON-driven creation workflow.
- Added voter management capabilities: create, edit, profile updates, address edits, and eligibility updates.
- Added voter card management features, including searchable views and status updates.
- Added admin contest results page and closed-group tabulation visibility.
- Added API and page tests across ballot submission, admin dashboard/session handling, token endpoint, and voter creation.

### Changed

- Updated theme handling for improved dark-mode behavior and utilities.
- Updated contest-group status language from inactive-focused wording toward closed-state clarity.
- Improved README coverage with workflow details and feature screenshots.

### Fixed

- Fixed ballot eligibility/contest visibility issues for ineligible users.
- Fixed voter card generator layout/text wrapping details.
- Simplified/strengthened ballot and voter-card status checks in critical submission paths.

## 2026-02-29 to 2026-02-20

### Added

- Added core voter card model, utilities, status handling, and management pages.
- Added contest status modeling (`active`/`upcoming` and related validation) across contest-group flows.
- Added polling-station CRUD and batch creation capabilities.
- Added voter eligibility creation endpoints, validators, and admin UI flows.
- Added JWT-based voter token generation/validation and improved ballot normalization.

### Changed

- Refactored admin session checks into reusable route-protection utilities.
- Improved admin action access-level checks and naming consistency.
- Expanded contest creation/editing to include contest status management.

### Fixed

- Fixed voter card code generation consistency and submission error handling.
- Fixed miscellaneous import, lint, and formatting defects.

## 2026-02-19 to 2026-02-13

### Added

- Initial project foundation with SvelteKit, TypeScript, Drizzle schema, migrations, and seed endpoint.
- Added authentication/session support, role modeling (`admin`, `super_admin`, `voter`), and protected admin flows.
- Added admin dashboard/login and admin-management workflows.
- Added contest-group creation and management baseline with related schema updates.
- Added shadcn-svelte based UI primitives and dashboard UI refinements.
- Added CI workflow for tests, linting, and type checks.

### Changed

- Iteratively improved landing/admin UI layout, accessibility, and validation/error messages.
- Refined schema relations for contest groups, contests, admins, and voter eligibility.

### Fixed

- Fixed early navigation, import, and lint issues discovered during initial stabilization.
