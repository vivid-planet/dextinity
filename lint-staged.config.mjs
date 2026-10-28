/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
    "{,!(demo|docs|packages|storybook)/**/}*.{ts,mts,cts,js,mjs,cjs,json,md,yml,yaml}": () => "pnpm lint:root",
};
