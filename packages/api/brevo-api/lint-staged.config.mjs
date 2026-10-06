/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
    "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}": () => "pnpm lint:eslint",
    "src/**/*.{ts,tsx}": () => "pnpm lint:tsc",
    "*.{js,json,md,yml,yaml}": () => "pnpm lint:prettier",
};
