/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
    "*.{ts,tsx,js,jsx,json,css,scss,md}": () => "pnpm lint:eslint",
    "*.{ts,js,json,md,yml,yaml}": () => "pnpm lint:prettier",
};
