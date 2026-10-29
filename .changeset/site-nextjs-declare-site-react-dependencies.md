---
"@dextinity/site-nextjs": patch
---

Declare the dependencies of the bundled `@dextinity/site-react` code

`@dextinity/site-nextjs` includes the compiled code of `@dextinity/site-react`, which imports `clsx`, `fast-equals`, `scroll-into-view-if-needed` and `usehooks-ts`.
These packages are now dependencies of `@dextinity/site-nextjs` as well.
Before, the imports only resolved if the package manager hoisted the packages to a reachable `node_modules` folder.
Otherwise, `next build` failed with "Module not found: Can't resolve 'scroll-into-view-if-needed'", or the code used a different major version installed by another package.
