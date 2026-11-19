import type { BasicStageBlockData, KeyFactsItemBlockData, TeaserItemBlockData } from "@src/blocks.generated";
import {
    createCallToActionList,
    createHeading,
    createImageMedia,
    createInternalLink,
    createRichText,
    createSvgImage,
    createTextLink,
    loremIpsum,
} from "@src/storybook/blockFixtures";

export function createBasicStage({
    headline = "Welcome to Dextinity",
    seed = "stage",
    alignment = "left",
    overlay = 50,
}: { headline?: string; seed?: string; alignment?: BasicStageBlockData["alignment"]; overlay?: number } = {}): BasicStageBlockData {
    return {
        media: createImageMedia({ seed }),
        heading: createHeading({ headline, eyebrow: "Eyebrow", htmlTag: "h1" }),
        text: createRichText(loremIpsum),
        overlay,
        alignment,
        callToActionList: createCallToActionList(
            { text: "Get started", variant: "contained" },
            { text: "Learn more", variant: "outlined", link: createInternalLink() },
        ),
    };
}

export function createTeaserItem(title: string, seed: string): TeaserItemBlockData {
    return {
        media: createImageMedia({ seed }),
        title,
        description: createRichText(loremIpsum),
        link: createTextLink("Read more", createInternalLink()),
        titleHtmlTag: "h3",
    };
}

export function createKeyFactsItem({ fact, label, hasIcon = true }: { fact: string; label: string; hasIcon?: boolean }): KeyFactsItemBlockData {
    return {
        icon: hasIcon ? createSvgImage("/assets/icons/overview.svg") : {},
        fact,
        label,
        description: createRichText(loremIpsum),
    };
}
