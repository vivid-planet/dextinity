# @comet/mail-react

## 8.31.0

## 8.30.1

## 8.30.0

## 8.29.0

## 8.28.2

## 8.28.1

## 8.28.0

## 8.27.1

## 8.27.0

## 8.26.0

## 8.25.1

## 8.25.0

## 8.24.5

## 8.24.4

## 8.24.3

## 8.24.2

## 8.24.1

## 8.24.0

## 8.23.4

## 8.23.3

## 8.23.2

## 8.23.1

## 8.23.0

## 8.22.0

## 8.21.1

## 8.21.0

## 8.20.4

## 8.20.3

## 8.20.2

## 8.20.1

## 8.20.0

## 8.19.0

## 8.18.0

## 8.17.1

## 8.17.0

## 8.16.0

## 8.15.0

## 8.14.0

### Minor Changes

- 57a7c95: Re-export all components from `@faire/mjml-react` and remove it as a `peerDependency`

## 8.13.0

## 8.12.0

### Minor Changes

- 51a213a: Add mjml-compatible versions of the following block factories
    - `BlocksBlock`
    - `ListBlock`
    - `OneOfBlock`
    - `OptionalBlock`

- b4e0609: Make this package ESM and add peer dependencies to `react` and `@faire/mjml-react`

    Previously, this package was published as a CommonJS package and had no peer dependencies.
    Now, it is published as an ESM package and has peer dependencies to `react@18` and `@faire/mjml-react@3`.

    Though this is theoretically a breaking change, we are bumping only the minor version, as this package is completely new and has no known users yet.

## 8.11.1

## 8.11.0

### Minor Changes

- b9e0968: The new `@comet/mail-react` package provides utilities for building HTML emails with React
- b9e0968: Add the `css` helper function

    Similar to the `css` function provided by styled-components or @mui/material.
    It simply returns the string passed into it but provides CSS syntax highlighting and auto-formatting when using certain IDE plugins, e.g. the "styled-components" plugin in VSCode.
