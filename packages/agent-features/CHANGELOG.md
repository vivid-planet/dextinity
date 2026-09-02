# @comet/agent-features

## 8.31.0

## 8.30.1

## 8.30.0

### Minor Changes

- 267754c: Add the `comet-admin-ui`, `comet-mail-react`, `comet-major-migration`, `comet-minor-update` and `dev-pm` skills, and rename `dx-block` to `comet-block`

    The skills are backported from v9 and adapted to the v8 API, so projects on v8 get Comet-branded skills matching the packages they actually have installed:
    - **`comet-admin-ui`** — building admin UI with the theme, components and helpers of `@comet/admin` instead of custom CSS. Documents the date/time pickers under their v8 names (`Future_DatePicker` and siblings).
    - **`comet-block`** — creating and editing blocks across API, Admin and Site, including fixtures. Same skill as the former `dx-block`, renamed for consistency.
    - **`comet-mail-react`** — building HTML emails with `@comet/mail-react` and MJML. Covers what v8 provides: the MJML components, `renderToMjml`, the block components and the `css` helper, plus the project-side patterns for the mail root, shared defaults and responsive styles. The theme and component layer added in v9 is not part of it.
    - **`comet-major-migration`** and **`comet-minor-update`** — upgrading a project across a major, and bumping `@comet/*` within the current major.
    - **`dev-pm`** — running, restarting and inspecting long-running dev processes via `dev-pm`.

    An internal `comet-core-admin-component-authoring` skill is included in the package as well; like every skill marked internal, it is excluded when installing into a project.

## 8.29.0

### Minor Changes

- dc0f09d: Add `@comet/agent-features` package containing skills for AI coding agents

## 8.28.2
