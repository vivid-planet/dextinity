import { Field, type FieldProps, FinalFormInput, Loading, messages, SelectField } from "@dextinity/admin";
import { Add, ArtificialIntelligence, Delete } from "@dextinity/admin-icons";
import { Box, Divider, Grid, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import arrayMutators from "final-form-arrays";
import { useState } from "react";
import { Field as ReactFinalFormField, useForm } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";
import { FormattedMessage, useIntl } from "react-intl";

import type { SeoBlockData, SeoBlockInput } from "../blocks.generated";
import { useContentGenerationConfig } from "../documents/ContentGenerationConfigContext";
import { validateJson } from "../validation/validateJson";
import { validateUrl } from "../validation/validateUrl";
import { BlockAdminComponentButton } from "./common/BlockAdminComponentButton";
import { BlockAdminComponentPaper } from "./common/BlockAdminComponentPaper";
import { BlockAdminComponentSectionGroup } from "./common/BlockAdminComponentSectionGroup";
import { Collapsible } from "./common/Collapsible";
import { CollapsibleSwitchButtonHeader } from "./common/CollapsibleSwitchButtonHeader";
import { createOptionalBlock } from "./factories/createOptionalBlock";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
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

        AdminComponent: ({ state, updateState }) => {
            const intl = useIntl();
            const { openGraphImage } = composedApi.adminComponents({
                state,
                updateState: decomposeUpdateStateAction(updateState, ["openGraphImage"]),
            });

            const priorityOptions = useSitemapPagePriorityFormOptions();
            const changeFrequencyOptions = useSitemapChangeFrequencyFormOptions();

            const generateSeoTag = useSeoTagGeneration();

            return (
                <div>
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

                                alternativeLinks: values.alternativeLinks,
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
                        {/* Meta */}
                        <Box marginBottom={8}>
                            <Typography variant="h4" gutterBottom>
                                <FormattedMessage id="dextinity.blocks.seo.meta.sectionTitle" defaultMessage="Meta Tags" />
                            </Typography>

                            <FieldWithContentGeneration
                                label={intl.formatMessage({
                                    id: "dextinity.blocks.seo.htmlTitle",
                                    defaultMessage: "HTML Title",
                                })}
                                name="htmlTitle"
                                generateSeoTag={generateSeoTag}
                                component={FinalFormInput}
                                fullWidth
                            />

                            <FieldWithContentGeneration
                                label={intl.formatMessage({
                                    id: "dextinity.blocks.seo.metaDescription",
                                    defaultMessage: "Meta Description",
                                })}
                                name="metaDescription"
                                generateSeoTag={generateSeoTag}
                                multiline
                                rows={3}
                                rowsMax={5}
                                component={FinalFormInput}
                                fullWidth
                            />
                        </Box>

                        {/* Open Graph */}
                        <Box marginTop={8} marginBottom={8}>
                            <Typography variant="h4" gutterBottom>
                                <FormattedMessage id="dextinity.blocks.seo.openGraph.sectionTitle" defaultMessage="Open Graph" />
                            </Typography>
                            <FieldWithContentGeneration
                                label={intl.formatMessage({
                                    id: "dextinity.blocks.seo.openGraphTitle",
                                    defaultMessage: "Title",
                                })}
                                name="openGraphTitle"
                                generateSeoTag={generateSeoTag}
                                component={FinalFormInput}
                                fullWidth
                            />
                            <FieldWithContentGeneration
                                label={intl.formatMessage({
                                    id: "dextinity.blocks.seo.openGraphDescription",
                                    defaultMessage: "Description",
                                })}
                                name="openGraphDescription"
                                generateSeoTag={generateSeoTag}
                                multiline={true}
                                rows={3}
                                rowsMax={5}
                                component={FinalFormInput}
                                fullWidth
                            />
                            {openGraphImage}
                        </Box>

                        {/* Structured Data */}
                        <Box marginTop={8} marginBottom={8}>
                            <Typography variant="h4" gutterBottom>
                                <FormattedMessage id="dextinity.blocks.seo.structuredData.sectionTitle" defaultMessage="Structured Data" />
                            </Typography>
                            <Field name="structuredData" multiline={true} rows={15} component={FinalFormInput} fullWidth validate={validateJson} />
                        </Box>

                        {/* Sitemap */}
                        <Box marginTop={8} marginBottom={8}>
                            <Typography variant="h4" gutterBottom>
                                <FormattedMessage id="dextinity.blocks.seo.sitemap.sectionTitle" defaultMessage="Sitemap" />
                            </Typography>

                            <ReactFinalFormField
                                name="noIndex"
                                type="checkbox"
                                parse={(v) => {
                                    return !v; // parse from noIndex to index
                                }}
                                format={(v) => {
                                    return !v; // format back from index to noIndex
                                }}
                            >
                                {({ input: { checked, onChange } }) => {
                                    const open = checked ? checked : false;
                                    return (
                                        <Paper variant="outlined">
                                            <Collapsible
                                                open={open}
                                                header={
                                                    <CollapsibleSwitchButtonHeader
                                                        checked={open}
                                                        title={<FormattedMessage id="dextinity.seo.sitemap.pageIndex" defaultMessage="Page Index" />}
                                                    />
                                                }
                                                onChange={onChange}
                                            >
                                                <Divider />
                                                <Box padding={4}>
                                                    <SelectField
                                                        label={intl.formatMessage({
                                                            id: "dextinity.blocks.seo.sitemap.priority",
                                                            defaultMessage: "Priority",
                                                        })}
                                                        name="priority"
                                                        fullWidth
                                                        required
                                                        options={priorityOptions}
                                                    />
                                                    <SelectField
                                                        label={intl.formatMessage({
                                                            id: "dextinity.blocks.seo.sitemap.changeFrequency",
                                                            defaultMessage: "Change Frequency",
                                                        })}
                                                        name="changeFrequency"
                                                        fullWidth
                                                        required
                                                        options={changeFrequencyOptions}
                                                    />
                                                </Box>
                                            </Collapsible>
                                        </Paper>
                                    );
                                }}
                            </ReactFinalFormField>
                        </Box>

                        {/* Canonical Tag */}
                        <Box marginTop={8} marginBottom={8}>
                            <Typography variant="h4" gutterBottom>
                                <FormattedMessage id="dextinity.blocks.seo.canonicalTag.sectionTitle" defaultMessage="Canonical Tag" />
                            </Typography>
                            <Field label={<FormattedMessage {...messages.url} />} name="canonicalUrl" component={FinalFormInput} fullWidth />
                        </Box>

                        {/* Alternate Hreflang */}
                        <Box marginTop={8} marginBottom={8}>
                            <BlockAdminComponentSectionGroup
                                title={<FormattedMessage id="dextinity.blocks.seo.alternativeLinks.sectionTitle" defaultMessage="Alternate links" />}
                            >
                                <BlockAdminComponentPaper>
                                    <FieldArray name="alternativeLinks">
                                        {({ fields }) => (
                                            <>
                                                {fields.map((link, i) => (
                                                    <Grid key={i} container spacing={2} sx={{ marginBottom: 2 }}>
                                                        <Grid size={3}>
                                                            <Field
                                                                label={
                                                                    <FormattedMessage
                                                                        id="dextinity.blocks.seo.alternativeLinks.code"
                                                                        defaultMessage="Code"
                                                                    />
                                                                }
                                                                name={`${link}.code`}
                                                                component={FinalFormInput}
                                                                placeholder="en-US"
                                                            />
                                                        </Grid>
                                                        <Grid size="grow">
                                                            <Field
                                                                label={<FormattedMessage {...messages.url} />}
                                                                name={`${link}.url`}
                                                                component={FinalFormInput}
                                                                fullWidth
                                                                validate={(url) => validateUrl(url)}
                                                            />
                                                        </Grid>
                                                        <Grid alignSelf="flex-start">
                                                            <DeleteButtonWrapper>
                                                                <IconButton onClick={() => fields.remove(i)} size="large">
                                                                    <Delete />
                                                                </IconButton>
                                                            </DeleteButtonWrapper>
                                                        </Grid>
                                                    </Grid>
                                                ))}
                                                <BlockAdminComponentButton variant="primary" onClick={() => fields.push({ code: "", url: "" })}>
                                                    <AddButtonContent>
                                                        <AddButtonIcon />
                                                        <Typography>
                                                            <FormattedMessage {...messages.add} />
                                                        </Typography>
                                                    </AddButtonContent>
                                                </BlockAdminComponentButton>
                                            </>
                                        )}
                                    </FieldArray>
                                </BlockAdminComponentPaper>
                            </BlockAdminComponentSectionGroup>
                        </Box>
                    </BlocksFinalForm>
                </div>
            );
        },
    };

    if (override) {
        return override(SeoBlock);
    }

    return SeoBlock;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
interface FieldWithContentGenerationProps<FieldValue = any, FieldElement extends HTMLElement = HTMLElement>
    extends FieldProps<FieldValue, FieldElement> {
    name: SeoTag;
    generateSeoTag: (tag: SeoTag, currentValue: string | undefined) => Promise<string>;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function FieldWithContentGeneration<FieldValue = any, FieldElement extends HTMLElement = HTMLElement>({
    name,
    generateSeoTag,
    endAdornment: passedEndAdornment,
    ...props
}: FieldWithContentGenerationProps<FieldValue, FieldElement>) {
    const contentGenerationConfig = useContentGenerationConfig();
    const formApi = useForm();

    const [loading, setLoading] = useState(false);

    const endAdornment = contentGenerationConfig?.seo ? (
        <>
            {passedEndAdornment}
            <IconButton
                color="primary"
                onClick={async () => {
                    setLoading(true);
                    const seoTag = await generateSeoTag(name, formApi.getFieldState(name)?.value);
                    setLoading(false);
                    formApi.change(name, seoTag);
                }}
            >
                {loading ? <Loading behavior="fillParent" fontSize="large" /> : <ArtificialIntelligence />}
            </IconButton>
        </>
    ) : (
        passedEndAdornment
    );

    return <Field name={name} endAdornment={endAdornment} {...props} />;
}

const AddButtonContent = styled("span")`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
`;

const AddButtonIcon = styled(Add)`
    font-size: 24px;
    margin-bottom: 8px;
`;

const DeleteButtonWrapper = styled("div")`
    padding-top: 24px;
`;
