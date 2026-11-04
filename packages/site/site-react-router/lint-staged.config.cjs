module.exports = {
    "{src,e2e}/**/*.{ts,tsx,js,jsx,json,css,scss,md}": () => "pnpm lint:eslint",
    "{src,e2e}/**/*.{ts,tsx}": () => "pnpm lint:tsc",
    "*.{ts,mts,js,json,md,yml,yaml,css,scss}": () => "pnpm lint:prettier",
};
