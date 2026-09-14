import { useIntl } from "react-intl";

const useSitemapChangeFrequencyFormOptions = (): Array<{ value: string; label: string }> => {
    const intl = useIntl();

    return [
        {
            value: "always",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.always",
                defaultMessage: "always",
            }),
        },
        {
            value: "hourly",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.hourly",
                defaultMessage: "hourly",
            }),
        },
        {
            value: "daily",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.daily",
                defaultMessage: "daily",
            }),
        },
        {
            value: "weekly",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.weekly",
                defaultMessage: "weekly",
            }),
        },
        {
            value: "monthly",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.monthly",
                defaultMessage: "monthly",
            }),
        },
        {
            value: "yearly",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.yearly",
                defaultMessage: "yearly",
            }),
        },
        {
            value: "never",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.changeFrequency.never",
                defaultMessage: "never",
            }),
        },
    ];
};
export default useSitemapChangeFrequencyFormOptions;
