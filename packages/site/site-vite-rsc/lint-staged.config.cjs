module.exports = {
    "{src,e2e}/**/*.{ts,tsx,js,jsx,json,md}": () => "pnpm lint:eslint",
    "{src,e2e}/**/*.{ts,tsx}": () => "pnpm lint:tsc",
    "*.{ts,mts,js,json,md,yml,yaml}": () => "pnpm lint:prettier",
};
