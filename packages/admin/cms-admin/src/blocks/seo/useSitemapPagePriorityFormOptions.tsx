import { useIntl } from "react-intl";

const useSitemapPagePriorityFormOptions = (): Array<{ value: string; label: string }> => {
    const intl = useIntl();

    return [
        {
            value: "0_0",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.priority.0_0",
                defaultMessage: "0.0 (Low)",
            }),
        },
        {
            value: "0_1",
            label: "0.1",
        },
        {
            value: "0_2",
            label: "0.2",
        },
        {
            value: "0_3",
            label: "0.3",
        },
        {
            value: "0_4",
            label: "0.4",
        },
        {
            value: "0_5",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.priority.0_5",
                defaultMessage: "0.5 (Default)",
            }),
        },
        {
            value: "0_6",
            label: "0.6",
        },
        {
            value: "0_7",
            label: "0.7",
        },
        {
            value: "0_8",
            label: "0.8",
        },
        {
            value: "0_9",
            label: "0.9",
        },
        {
            value: "1_0",
            label: intl.formatMessage({
                id: "dextinity.blocks.seo.sitemap.priority.1_0",
                defaultMessage: "1.0 (High)",
            }),
        },
    ];
};
export default useSitemapPagePriorityFormOptions;
