module.exports = {
    "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}": () => "pnpm lint:eslint",
    "src/**/*.{ts,tsx}": () => "pnpm lint:tsc",
    "*.{js,json,md,yml,yaml}": () => "pnpm lint:prettier",
};
