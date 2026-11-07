import { gql, useApolloClient, useMutation } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { FieldActions, Typography } from "@dextinity/ui";
import { DateRangeField, type FieldAdapterActions, InputField, SelectField, TextareaField } from "@dextinity/ui-react-final-form";
import type { DocumentNode } from "graphql";
import type { FocusEvent, PropsWithChildren, ReactNode } from "react";
import { useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";

import { useContentTranslationFieldActionsProps } from "../../blocks/form/useContentTranslationFieldActions";
import { ImageCropSettingsFields } from "../../common/image/ImageCropSettingsFields";
import { useContentLanguage } from "../../contentLanguage/useContentLanguage";
import { useContentScope } from "../../contentScope/Provider";
import { useDateRangePickerLabels } from "../../form/useDatePickerLabels";
import type { GQLDamFileAiContentType } from "../../graphql.generated";
import { useDamConfig } from "../config/damConfig";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { slugifyFilename } from "../helpers/slugifyFilename";
import type { DamFileDetails, EditFileFormValues } from "./EditFile";
import type { GQLDamIsFilenameOccupiedQuery, GQLDamIsFilenameOccupiedQueryVariables } from "./FileSettingsFields.generated";
import { generateAltTextMutation, generateImageTitleMutation } from "./FileSettingsFields.gql";
import { Fields, FullWidth, Section, SectionHead, Sections } from "./FileSettingsFields.sc";
import { getLicenseTypeLabel, type LicenseType, licenseTypes } from "./licenseType";

const damIsFilenameOccupiedQuery = gql`
    query DamIsFilenameOccupied($filename: String!, $folderId: String, $scope: DamScopeInput!) {
        damIsFilenameOccupied(filename: $filename, folderId: $folderId, scope: $scope)
    }
`;

type AiContentTypeOption = GQLDamFileAiContentType | "none";

function getExtension(filename: string) {
    return filename.split(".").pop() ?? "";
}

function getNameWithoutExtension(filename: string) {
    return filename.split(".").slice(0, -1).join(".");
}

interface FileSettingsFieldsProps {
    file: DamFileDetails;
    /** Called with a message for the user when generating a text with AI failed. */
    onError: (message: string) => void;
}

/**
 * The settings of a DAM file, for the React Final Form form of `EditFile`: name, crop and focus point of images, SEO texts, AI content
 * disclosure, and the license.
 */
export function FileSettingsFields({ file, onError }: FileSettingsFieldsProps) {
    const intl = useIntl();
    const apollo = useApolloClient();
    const scope = useDamScope();
    const damConfig = useDamConfig();
    const form = useForm<EditFileFormValues>();
    const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const folderId = file.folder?.id ?? null;
    const extension = getExtension(file.name);
    const isImage = file.image != null;
    // A deep fake can only be image, audio or video content, so the AI content disclosure is limited to those types.
    // Vector images (SVG) are excluded because they cannot appear photorealistic.
    const supportsAiContentType =
        filteredAcceptedMimeTypes.pixelImage.includes(file.mimetype) ||
        filteredAcceptedMimeTypes.video.includes(file.mimetype) ||
        filteredAcceptedMimeTypes.audio.includes(file.mimetype);

    const altTextActions = useGeneratedTextFieldActions({
        fileId: file.id,
        isEnabled: isImage && Boolean(damConfig.contentGeneration?.generateAltText),
        mutation: generateAltTextMutation,
        resultField: "generateAltText",
        onError,
    });
    const titleActions = useGeneratedTextFieldActions({
        fileId: file.id,
        isEnabled: isImage && Boolean(damConfig.contentGeneration?.generateImageTitle),
        mutation: generateImageTitleMutation,
        resultField: "generateImageTitle",
        onError,
    });

    const requiredMessage = intl.formatMessage({ id: "dextinity.form.required", defaultMessage: "Required" });

    const validateFilename = async (value: string | undefined, _allValues: object, meta?: { dirty?: boolean }) => {
        if (value == null || getNameWithoutExtension(value).trim() === "") {
            return requiredMessage;
        }
        if (!meta?.dirty) {
            return undefined;
        }
        const { data } = await apollo.query<GQLDamIsFilenameOccupiedQuery, GQLDamIsFilenameOccupiedQueryVariables>({
            query: damIsFilenameOccupiedQuery,
            variables: { filename: value, folderId, scope },
            fetchPolicy: "network-only",
        });
        return data.damIsFilenameOccupied
            ? intl.formatMessage({ id: "dextinity.dam.file.validate.filename.error", defaultMessage: "Filename already exists" })
            : undefined;
    };

    // Slugifying while typing would remove spaces and other characters right away, so the name is slugified when the field is left
    const slugifyNameOnBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (event.target instanceof HTMLInputElement && event.target.name === "name") {
            const nameWithoutExtension = getNameWithoutExtension(form.getState().values.name ?? "");
            if (nameWithoutExtension !== "") {
                form.change("name", slugifyFilename(nameWithoutExtension, extension));
            }
        }
    };

    return (
        <Sections>
            <SettingsSection title={intl.formatMessage({ id: "dextinity.dam.file.general", defaultMessage: "General" })}>
                <FullWidth onBlur={slugifyNameOnBlur}>
                    <InputField<string>
                        name="name"
                        label={intl.formatMessage({ id: "dextinity.dam.file.fileName", defaultMessage: "File Name" })}
                        required
                        requiredMessage={requiredMessage}
                        suffix={`.${extension}`}
                        format={(value) => getNameWithoutExtension(value ?? "")}
                        parse={(value) => `${value}.${extension}`}
                        validate={validateFilename}
                    />
                </FullWidth>
            </SettingsSection>
            {isImage && (
                <Section>
                    <ImageCropSettingsFields />
                </Section>
            )}
            <SettingsSection
                title={intl.formatMessage({ id: "dextinity.dam.file.seo", defaultMessage: "SEO" })}
                description={intl.formatMessage({
                    id: "dextinity.dam.file.seo.description",
                    defaultMessage: "Describe the file for people who can't see it and for search engines.",
                })}
            >
                <FullWidth>
                    <InputField
                        name="altText"
                        label={intl.formatMessage({ id: "dextinity.dam.file.altText", defaultMessage: "Alternative Text" })}
                        actions={altTextActions}
                    />
                </FullWidth>
                <FullWidth>
                    <InputField
                        name="title"
                        label={intl.formatMessage({ id: "dextinity.dam.file.title", defaultMessage: "Title" })}
                        actions={titleActions}
                    />
                </FullWidth>
            </SettingsSection>
            {supportsAiContentType && (
                <SettingsSection title={intl.formatMessage({ id: "dextinity.dam.file.aiContent", defaultMessage: "AI content" })}>
                    <FullWidth>
                        <SelectField<false, AiContentTypeOption, GQLDamFileAiContentType | null>
                            name="aiContentType"
                            label={intl.formatMessage({
                                id: "dextinity.dam.file.aiContentType",
                                defaultMessage: "Was this asset generated or modified using AI?",
                            })}
                            helperText={intl.formatMessage({
                                id: "dextinity.dam.file.aiContentType.helperText",
                                defaultMessage:
                                    "The EU AI Act (Article 50) requires AI-generated or AI-modified content to be marked as such. Set this for any asset that was generated or edited using artificial intelligence.",
                            })}
                            format={(value) => value ?? "none"}
                            parse={(value) => (value == null || value === "none" ? null : value)}
                            options={[
                                { value: "none", label: intl.formatMessage({ id: "dextinity.dam.file.aiContentType.no", defaultMessage: "No" }) },
                                {
                                    value: "Generated",
                                    label: intl.formatMessage({ id: "dextinity.dam.file.aiContentType.generated", defaultMessage: "AI generated" }),
                                },
                                {
                                    value: "Modified",
                                    label: intl.formatMessage({ id: "dextinity.dam.file.aiContentType.modified", defaultMessage: "AI modified" }),
                                },
                            ]}
                        />
                    </FullWidth>
                </SettingsSection>
            )}
            {damConfig.enableLicenseFeature && <LicenseFields isLicenseRequired={Boolean(damConfig.requireLicense)} />}
        </Sections>
    );
}

interface SettingsSectionProps {
    title: string;
    description?: ReactNode;
}

function SettingsSection({ title, description, children }: PropsWithChildren<SettingsSectionProps>) {
    return (
        <Section>
            <SectionHead>
                <Typography variant="section" element="h3">
                    {title}
                </Typography>
                {description != null && (
                    <Typography variant="small" element="p">
                        {description}
                    </Typography>
                )}
            </SectionHead>
            <Fields>{children}</Fields>
        </Section>
    );
}

function LicenseFields({ isLicenseRequired }: { isLicenseRequired: boolean }) {
    const intl = useIntl();
    const dateRangePickerLabels = useDateRangePickerLabels();
    const {
        values: { license },
    } = useFormState<EditFileFormValues>({ subscription: { values: true } });
    const hasNoLicense = license.type === "NO_LICENSE";
    const requiredMessage = intl.formatMessage({ id: "dextinity.form.required", defaultMessage: "Required" });

    return (
        <SettingsSection title={intl.formatMessage({ id: "dextinity.dam.file.licenseInformation", defaultMessage: "License information" })}>
            <SelectField<false, LicenseType>
                name="license.type"
                label={intl.formatMessage({ id: "dextinity.dam.file.type", defaultMessage: "Type" })}
                required={isLicenseRequired}
                requiredMessage={requiredMessage}
                options={licenseTypes.map((licenseType) => ({ value: licenseType, label: getLicenseTypeLabel(intl, licenseType) }))}
                validate={(value) =>
                    isLicenseRequired && value === "NO_LICENSE"
                        ? intl.formatMessage({ id: "dextinity.dam.file.error.license.type", defaultMessage: "License type is required" })
                        : undefined
                }
            />
            <InputField
                name="license.author"
                label={intl.formatMessage({ id: "dextinity.dam.file.creatorOrAuthor", defaultMessage: "Creator/Author" })}
                disabled={hasNoLicense}
            />
            <FullWidth>
                <TextareaField
                    name="license.details"
                    label={intl.formatMessage({ id: "dextinity.dam.file.licenseDetails", defaultMessage: "License details" })}
                    rows={3}
                    disabled={hasNoLicense}
                />
            </FullWidth>
            <FullWidth>
                <DateRangeField
                    name="license.duration"
                    label={intl.formatMessage({ id: "dextinity.dam.file.licenseDuration", defaultMessage: "License duration" })}
                    locale={intl.locale}
                    disabled={hasNoLicense}
                    required={isLicenseRequired && license.type === "RIGHTS_MANAGED"}
                    requiredMessage={requiredMessage}
                    labels={{
                        ...dateRangePickerLabels,
                        start: intl.formatMessage({ id: "dextinity.dam.file.licenseDurationFrom", defaultMessage: "From" }),
                        end: intl.formatMessage({ id: "dextinity.dam.file.licenseDurationTo", defaultMessage: "To" }),
                    }}
                />
            </FullWidth>
        </SettingsSection>
    );
}

interface UseGeneratedTextFieldActionsOptions {
    fileId: string;
    isEnabled: boolean;
    mutation: DocumentNode;
    resultField: "generateAltText" | "generateImageTitle";
    onError: (message: string) => void;
}

function useGeneratedTextFieldActions({
    fileId,
    isEnabled,
    mutation,
    resultField,
    onError,
}: UseGeneratedTextFieldActionsOptions): FieldAdapterActions<string> | undefined {
    const intl = useIntl();
    const contentScope = useContentScope();
    const language = useContentLanguage(contentScope);
    const [generate] = useMutation<Record<typeof resultField, string>, { fileId: string; language: string }>(mutation);
    const getTranslationActionsProps = useContentTranslationFieldActionsProps();

    if (!isEnabled && !getTranslationActionsProps) {
        return undefined;
    }

    const labels = {
        aiAssist: intl.formatMessage({ id: "dextinity.dam.file.generateWithAi", defaultMessage: "Generate with AI" }),
        suggestion: intl.formatMessage({ id: "dextinity.dam.file.aiSuggestion", defaultMessage: "AI suggestion" }),
        accept: intl.formatMessage({ id: "dextinity.dam.file.aiSuggestion.accept", defaultMessage: "Accept" }),
        discard: intl.formatMessage({ id: "dextinity.dam.file.aiSuggestion.discard", defaultMessage: "Discard" }),
    };

    return (context) => {
        const translationActionsProps = getTranslationActionsProps?.(context);
        return (
            <FieldActions
                {...translationActionsProps}
                labels={{ ...translationActionsProps?.labels, ...labels }}
                aiAssist={isEnabled}
                onAiSuggest={async () => {
                    const { data } = await generate({ variables: { fileId, language }, context: LocalErrorScopeApolloContext });
                    const generatedText = data?.[resultField];
                    if (!generatedText) {
                        throw new Error(`${resultField} returned no text`);
                    }
                    return generatedText;
                }}
                onAiAccept={context.setValue}
                onAiError={() =>
                    onError(intl.formatMessage({ id: "dextinity.dam.file.generateFailed", defaultMessage: "The text couldn't be generated" }))
                }
            />
        );
    };
}
