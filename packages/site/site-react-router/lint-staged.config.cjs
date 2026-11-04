module.exports = {
    "src/**/*.{ts,tsx,js,jsx,json,md}": () => "pnpm lint:eslint",
    "src/**/*.{ts,tsx}": () => "pnpm lint:tsc",
    "*.{ts,mts,js,json,md,yml,yaml}": () => "pnpm lint:prettier",
};
