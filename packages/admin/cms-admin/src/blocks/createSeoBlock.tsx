import { messages } from "@dextinity/admin";
import { Button, FieldActions, Icon, IconButton } from "@dextinity/ui";
import { type FieldAdapterActions, InputField, SelectField, TextareaField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import arrayMutators from "final-form-arrays";
import { Field as ReactFinalFormField } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import { FormattedMessage, useIntl } from "react-intl";

import type { SeoBlockData, SeoBlockInput } from "../blocks.generated";
import { useContentGenerationConfig } from "../documents/ContentGenerationConfigContext";
import { validateJson } from "../validation/validateJson";
import { validateUrl } from "../validation/validateUrl";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSection } from "./common/BlockAdminComponentSection";
import { Collapsible } from "./common/Collapsible";
import { CollapsibleSwitchButtonHeader } from "./common/CollapsibleSwitchButtonHeader";
import { createOptionalBlock } from "./factories/createOptionalBlock";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { useContentTranslationFieldActionsProps } from "./form/useContentTranslationFieldActions";
import { composeBlocks } from "./helpers/composeBlocks/composeBlocks";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { decomposeUpdateStateAction } from "./helpers/decomposeUpdateStateAction";
import { withAdditionalBlockAttributes } from "./helpers/withAdditionalBlockAttributes";
import { PixelImageBlock } from "./PixelImageBlock";
import { type SeoTag, useSeoTagGeneration } from "./seo/useSeoTagGeneration";
import useSitemapChangeFrequencyFormOptions from "./seo/useSitemapChangeFrequencyFormOptions";
import useSitemapPagePriorityFormOptions from "./seo/useSitemapPagePriorityFormOptions";
import type { BlockInterface, BlockState } from "./types";

interface CreateSeoBlockOptions {
    image?: BlockInterface;
}

export function createSeoBlock(
    { image = PixelImageBlock }: CreateSeoBlockOptions = {},
    override?: (block: BlockInterface) => BlockInterface,
): BlockInterface {
    const OptionalImageBlock = createOptionalBlock(image, {
        title: <FormattedMessage id="dextinity.sitemap.openGraphImage" defaultMessage="Open Graph Image" />,
    });

    const composed = composeBlocks({ openGraphImage: OptionalImageBlock });

    const { api: composedApi, block: composedBlock } = composed;

    const block = withAdditionalBlockAttributes<Omit<SeoBlockData, "openGraphImage">>({
        noIndex: false,
        priority: "0_5",
        changeFrequency: "weekly",
        alternativeLinks: [],
        htmlTitle: undefined,
        metaDescription: undefined,
        openGraphTitle: undefined,
        openGraphDescription: undefined,
        structuredData: undefined,
        canonicalUrl: undefined,
    })(composedBlock);

    type State = BlockState<typeof block>;

    const SeoBlock: BlockInterface<SeoBlockData, State, SeoBlockInput> = {
        ...createBlockSkeleton(),
        ...block,
        name: "Seo",

        displayName: <FormattedMessage id="dextinity.blocks.seo" defaultMessage="SEO" />,

        extractTextContents: (state, options) => {
            const contents: string[] = [];

            if (state.htmlTitle) {
                contents.push(state.htmlTitle);
            }
            if (state.metaDescription) {
                contents.push(state.metaDescription);
            }
            if (state.openGraphTitle) {
                contents.push(state.openGraphTitle);
            }
            if (state.openGraphDescription) {
                contents.push(state.openGraphDescription);
            }

            contents.push(...(block.extractTextContents?.(state, options) ?? []));

            return contents;
        },

        AdminComponent: ({ state, updateState }) => {
            const intl = useIntl();
            const { openGraphImage } = composedApi.adminComponents({
                state,
                updateState: decomposeUpdateStateAction(updateState, ["openGraphImage"]),
            });

            const priorityOptions = useSitemapPagePriorityFormOptions();
            const changeFrequencyOptions = useSitemapChangeFrequencyFormOptions();
            const seoTagActions = useSeoTagFieldActions();

            return (
                <BlocksFinalForm
                    onSubmit={(values) => {
                        updateState((prevState) => ({
                            ...prevState,
                            htmlTitle: values.htmlTitle,
                            metaDescription: values.metaDescription,

                            openGraphTitle: values.openGraphTitle,
                            openGraphDescription: values.openGraphDescription,

                            structuredData: values.structuredData,

                            noIndex: values.noIndex,
                            priority: values.priority,
                            changeFrequency: values.changeFrequency,

                            canonicalUrl: values.canonicalUrl,

                            alternativeLinks: values.alternativeLinks ?? [],
                        }));
                    }}
                    mutators={{ ...arrayMutators }}
                    initialValues={{
                        htmlTitle: state.htmlTitle,
                        metaDescription: state.metaDescription,

                        openGraphTitle: state.openGraphTitle,
                        openGraphDescription: state.openGraphDescription,

                        structuredData: state.structuredData,

                        noIndex: state.noIndex,
                        priority: state.priority,
                        changeFrequency: state.changeFrequency,

                        canonicalUrl: state.canonicalUrl,

                        alternativeLinks: state.alternativeLinks,
                    }}
                >
                    <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.seo.meta.sectionTitle" defaultMessage="Meta Tags" />}>
                        <Fields>
                            <InputField
                                label={intl.formatMessage({ id: "dextinity.blocks.seo.htmlTitle", defaultMessage: "HTML Title" })}
                                name="htmlTitle"
                                actions={seoTagActions("htmlTitle")}
                            />
                            <TextareaField
                                label={intl.formatMessage({ id: "dextinity.blocks.seo.metaDescription", defaultMessage: "Meta Description" })}
                                name="metaDescription"
                                rows={3}
                                actions={seoTagActions("metaDescription")}
                            />
                        </Fields>
                    </BlockAdminComponentSection>

                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.seo.openGraph.sectionTitle" defaultMessage="Open Graph" />}
                    >
                        <Fields>
                            <InputField
                                label={intl.formatMessage({ id: "dextinity.blocks.seo.openGraphTitle", defaultMessage: "Title" })}
                                name="openGraphTitle"
                                actions={seoTagActions("openGraphTitle")}
                            />
                            <TextareaField
                                label={intl.formatMessage({ id: "dextinity.blocks.seo.openGraphDescription", defaultMessage: "Description" })}
                                name="openGraphDescription"
                                rows={3}
                                actions={seoTagActions("openGraphDescription")}
                            />
                            {openGraphImage}
                        </Fields>
                    </BlockAdminComponentSection>

                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.seo.structuredData.sectionTitle" defaultMessage="Structured Data" />}
                    >
                        <TextareaField
                            label={intl.formatMessage({ id: "dextinity.blocks.seo.structuredData", defaultMessage: "JSON-LD" })}
                            name="structuredData"
                            rows={15}
                            maxRows={40}
                            spellCheck={false}
                            validate={validateJson}
                        />
                    </BlockAdminComponentSection>

                    <BlockAdminComponentSection title={<FormattedMessage id="dextinity.blocks.seo.sitemap.sectionTitle" defaultMessage="Sitemap" />}>
                        <ReactFinalFormField<boolean> name="noIndex" type="checkbox" parse={(index) => !index} format={(noIndex) => !noIndex}>
                            {({ input: { checked, onChange } }) => {
                                const pageIndex = checked ?? false;
                                return (
                                    <BlockAdminComponentPaper disablePadding>
                                        <Collapsible
                                            open={pageIndex}
                                            header={
                                                <CollapsibleSwitchButtonHeader
                                                    checked={pageIndex}
                                                    title={<FormattedMessage id="dextinity.seo.sitemap.pageIndex" defaultMessage="Page Index" />}
                                                />
                                            }
                                            onChange={onChange}
                                        >
                                            <CollapsibleFields>
                                                <SelectField
                                                    label={intl.formatMessage({
                                                        id: "dextinity.blocks.seo.sitemap.priority",
                                                        defaultMessage: "Priority",
                                                    })}
                                                    name="priority"
                                                    required
                                                    options={priorityOptions}
                                                />
                                                <SelectField
                                                    label={intl.formatMessage({
                                                        id: "dextinity.blocks.seo.sitemap.changeFrequency",
                                                        defaultMessage: "Change Frequency",
                                                    })}
                                                    name="changeFrequency"
                                                    required
                                                    options={changeFrequencyOptions}
                                                />
                                            </CollapsibleFields>
                                        </Collapsible>
                                    </BlockAdminComponentPaper>
                                );
                            }}
                        </ReactFinalFormField>
                    </BlockAdminComponentSection>

                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.seo.canonicalTag.sectionTitle" defaultMessage="Canonical Tag" />}
                    >
                        <InputField label={intl.formatMessage(messages.url)} name="canonicalUrl" type="url" validate={validateUrl} />
                    </BlockAdminComponentSection>

                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.blocks.seo.alternativeLinks.sectionTitle" defaultMessage="Alternate links" />}
                    >
                        <FieldArray<SeoBlockData["alternativeLinks"][number]> name="alternativeLinks">
                            {({ fields }) => (
                                <Fields>
                                    {fields.map((link, index) => (
                                        <AlternativeLinkRow key={link}>
                                            <InputField
                                                label={intl.formatMessage({
                                                    id: "dextinity.blocks.seo.alternativeLinks.code",
                                                    defaultMessage: "Code",
                                                })}
                                                name={`${link}.code`}
                                                placeholder="en-US"
                                            />
                                            <InputField
                                                label={intl.formatMessage(messages.url)}
                                                name={`${link}.url`}
                                                type="url"
                                                validate={validateUrl}
                                            />
                                            <AlternativeLinkRemoveButton>
                                                <IconButton
                                                    variant="text"
                                                    color="secondary"
                                                    aria-label={intl.formatMessage({
                                                        id: "dextinity.blocks.seo.alternativeLinks.remove",
                                                        defaultMessage: "Remove alternate link",
                                                    })}
                                                    onClick={() => fields.remove(index)}
                                                >
                                                    <Icon name="delete" />
                                                </IconButton>
                                            </AlternativeLinkRemoveButton>
                                        </AlternativeLinkRow>
                                    ))}
                                    <div>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<Icon name="add" />}
                                            onClick={() => fields.push({ code: "", url: "" })}
                                        >
                                            <FormattedMessage id="dextinity.blocks.seo.alternativeLinks.add" defaultMessage="Add alternate link" />
                                        </Button>
                                    </div>
                                </Fields>
                            )}
                        </FieldArray>
                    </BlockAdminComponentSection>
                </BlocksFinalForm>
            );
        },
    };

    if (override) {
        return override(SeoBlock);
    }

    return SeoBlock;
}

function useSeoTagFieldActions(): (tag: SeoTag) => FieldAdapterActions<string> | undefined {
    const intl = useIntl();
    const contentGenerationConfig = useContentGenerationConfig();
    const generateSeoTag = useSeoTagGeneration();
    const getTranslationActionsProps = useContentTranslationFieldActionsProps();
    const contentGenerationEnabled = Boolean(contentGenerationConfig?.seo);

    if (!contentGenerationEnabled && !getTranslationActionsProps) {
        return () => undefined;
    }

    const labels = {
        aiAssist: intl.formatMessage({ id: "dextinity.blocks.seo.generateSeoTag", defaultMessage: "Generate with AI" }),
        suggestion: intl.formatMessage({ id: "dextinity.blocks.seo.generatedSeoTag", defaultMessage: "AI suggestion" }),
        accept: intl.formatMessage({ id: "dextinity.blocks.seo.generatedSeoTag.accept", defaultMessage: "Accept" }),
        discard: intl.formatMessage({ id: "dextinity.blocks.seo.generatedSeoTag.discard", defaultMessage: "Discard" }),
    };

    return (tag) => (context) => {
        const translationActionsProps = getTranslationActionsProps?.(context);
        return (
            <FieldActions
                {...translationActionsProps}
                labels={{ ...translationActionsProps?.labels, ...labels }}
                aiAssist={contentGenerationEnabled}
                onAiSuggest={async () => {
                    const generatedTag = await generateSeoTag(tag, context.value);
                    if (!generatedTag) {
                        // generateSeoTag already showed the error
                        throw new Error(`Failed to generate ${tag}`);
                    }
                    return generatedTag;
                }}
                onAiAccept={context.setValue}
            />
        );
    };
}

const Fields = styled("div")`
    display: flex;
    flex-direction: column;
    gap: var(--dextinity-density-form-gap);
`;

const CollapsibleFields = styled(Fields)`
    padding: var(--dextinity-space-4);
    border-block-start: var(--dextinity-line-width) solid var(--dextinity-color-line);
`;

const AlternativeLinkRow = styled("div")`
    display: grid;
    grid-template-columns: minmax(6rem, 1fr) 3fr auto;
    align-items: start;
    gap: var(--dextinity-space-3);
`;

// Aligns the button with the inputs below their labels
const AlternativeLinkRemoveButton = styled("div")`
    display: flex;
    align-items: center;
    min-block-size: var(--dextinity-field-height);
    margin-block-start: calc(18px + var(--dextinity-field-gap));
`;
