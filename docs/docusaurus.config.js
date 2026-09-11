// @ts-check
const { themes } = require("prism-react-renderer");

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

// Both this docs site and the Storybook composition are deployed via Netlify with wildcard DNS
// for `*.cms-storybook.dextinity.com`. Mirror the runtime mapping in StorybookAdminComponentDocsIframe
// so the navbar link follows the docs deploy context: a PR's deploy-preview links to its matching
// Storybook deploy-preview, `next` to `next.cms-storybook.dextinity.com`, and main to production.
function getStorybookUrl() {
    if (process.env.CONTEXT === "deploy-preview" && process.env.REVIEW_ID) {
        return `https://deploy-preview-${process.env.REVIEW_ID}.cms-storybook.dextinity.com/`;
    }
    if (process.env.BRANCH === "next") {
        return "https://next.cms-storybook.dextinity.com/";
    }
    return "https://cms-storybook.dextinity.com/";
}

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Dextinity Docs",
    tagline: "",
    url: "https://cms-docs.dextinity.com",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: "https://github.com/vivid-planet/dextinity/edit/main/docs/",
                },
                blog: {
                    showReadingTime: true,
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                logo: {
                    alt: "Dextinity logo",
                    src: "img/dextinity-logo.svg",
                    srcDark: "img/dextinity-logo-dark.svg",
                },
                items: [
                    {
                        type: "doc",
                        docId: "Overview",
                        position: "left",
                        label: "Docs",
                    },
                    {
                        href: getStorybookUrl(),
                        position: "right",
                        label: "Storybook",
                    },
                    {
                        href: "https://github.com/vivid-planet/dextinity",
                        position: "right",
                        label: "GitHub",
                    },
                ],
            },
            footer: {
                style: "dark",
                copyright: `Copyright © ${new Date().getFullYear()} Vivid Planet Software GmbH. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
                magicComments: [
                    {
                        className: "theme-code-block-highlighted-line",
                        line: "highlight-next-line",
                        block: { start: "highlight-start", end: "highlight-end" },
                    },
                    {
                        className: "code-block-addition-line",
                        line: "addition-next-line",
                        block: { start: "addition-start", end: "addition-end" },
                    },
                    {
                        className: "code-block-removal-line",
                        line: "removal-next-line",
                        block: { start: "removal-start", end: "removal-end" },
                    },
                ],
                additionalLanguages: ["bash", "diff", "json"],
            },
            liveCodeBlock: {
                playgroundPosition: "top",
            },
            algolia: {
                appId: "KRLBC262QV",
                apiKey: "d7d66be907d32f32828bcb2344e7be6e",
                indexName: "dextinity",
                contextualSearch: true,
            },
            mermaid: {
                theme: { light: "neutral", dark: "dark" },
            },
        }),

    themes: ["@docusaurus/theme-mermaid"],
    markdown: {
        mermaid: true,
    },
};

module.exports = config;
