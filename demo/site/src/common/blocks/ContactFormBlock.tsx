"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { ContactFormBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import { acceptedFileTypes, maxFileSizeBytes } from "@src/util/fileUpload";
import { getRecaptchaToken } from "@src/util/recaptcha/getRecaptchaToken";
import { useSiteConfig } from "@src/util/SiteConfigProvider";
import { useParams } from "next/navigation";
import Script from "next/script";
import { useForm, useWatch } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../components/Button";
import { CheckboxField } from "../components/form/CheckboxField";
import { areAllFileUploadsFinished, type FileUpload, FileUploadField, getUploadedFileUploadIds } from "../components/form/FileUploadField";
import { SelectField } from "../components/form/SelectField";
import { TextareaField } from "../components/form/TextareaField";
import { TextField } from "../components/form/TextField";
import { Typography } from "../components/Typography";
import styles from "./ContactFormBlock.module.scss";

const subjectOptions = [
    { value: "Option 1", label: "Option 1" },
    { value: "Option 2", label: "Option 2" },
    { value: "Option 3", label: "Option 3" },
];

interface ContactFormValues {
    name: string;
    company?: string;
    email: string;
    phoneNumber?: string;
    subject: string;
    message: string;
    attachments: FileUpload[];
    privacyConsent: boolean;
}

export const ContactFormBlock = withPreview(
    ({ data }: PropsWithData<ContactFormBlockData>) => {
        const intl = useIntl();
        const params = useParams<{ visibility: string; domain: string; language: string }>();
        const language = params?.language;

        const { recaptchaSiteKey } = useSiteConfig();

        const {
            control,
            handleSubmit,
            setError,
            formState: { errors, isSubmitting },
        } = useForm<ContactFormValues>({
            defaultValues: {
                name: "",
                company: "",
                email: "",
                phoneNumber: "",
                subject: "",
                message: "",
                attachments: [],
                privacyConsent: false,
            },
        });

        const attachments = useWatch({ control, name: "attachments" });
        const isUploading = !areAllFileUploadsFinished(attachments ?? []);

        const onSubmit = async (formValues: ContactFormValues) => {
            let recaptchaToken: string;

            if (!recaptchaSiteKey) {
                console.error("Missing recaptchaSiteKey in siteConfig");
                setError("root.serverError", {
                    type: "manual",
                    message: intl.formatMessage({
                        id: "contactFormBlock.missingRecaptchaKey",
                        defaultMessage: "The form is currently unavailable. Please try again later.",
                    }),
                });
                return;
            }

            try {
                recaptchaToken = await getRecaptchaToken("form_submit", recaptchaSiteKey);
            } catch (error) {
                console.error(error);
                setError("root.serverError", {
                    type: "manual",
                    message: intl.formatMessage({
                        id: "contactFormBlock.missingRecaptchaToken",
                        defaultMessage: "ReCAPTCHA validation failed. Please try again.",
                    }),
                });
                return;
            }

            try {
                const response = await fetch(`/${language}/api/contact-form`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...formValues,
                        attachments: getUploadedFileUploadIds(formValues.attachments),
                        recaptchaToken,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Form submission failed");
                }
            } catch (error) {
                console.error("Form submission error:", error);
                setError("root.serverError", {
                    type: "manual",
                    message: intl.formatMessage({
                        id: "contactForm.submission.error",
                        defaultMessage: "An error occurred while submitting the form. Please try again.",
                    }),
                });
            }
        };

        return (
            <PageLayout grid>
                <Script src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`} />
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <TextField
                        name="name"
                        control={control}
                        rules={{
                            required: intl.formatMessage({ id: "contactForm.name.required", defaultMessage: "Please enter your name" }),
                        }}
                        placeholder={intl.formatMessage({ id: "contactForm.name.placeholder", defaultMessage: "First and last name" })}
                        label={intl.formatMessage({ id: "contactForm.name.label", defaultMessage: "Name" })}
                    />
                    <TextField
                        name="company"
                        control={control}
                        placeholder={intl.formatMessage({ id: "contactForm.company.placeholder", defaultMessage: "Company name" })}
                        label={intl.formatMessage({ id: "contactForm.company.label", defaultMessage: "Company" })}
                    />
                    <TextField
                        name="email"
                        control={control}
                        rules={{
                            required: intl.formatMessage({
                                id: "contactForm.email.required",
                                defaultMessage: "Please enter your email address",
                            }),
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: intl.formatMessage({ id: "contactForm.email.invalid", defaultMessage: "Invalid email address" }),
                            },
                        }}
                        placeholder={intl.formatMessage({ id: "contactForm.email.placeholder", defaultMessage: "Your email address" })}
                        label={intl.formatMessage({ id: "contactForm.email.label", defaultMessage: "Email" })}
                    />
                    <TextField
                        name="phoneNumber"
                        control={control}
                        rules={{
                            pattern: {
                                value: /^[0-9+]*$/,
                                message: intl.formatMessage({
                                    id: "contactForm.phoneNumber.invalid",
                                    defaultMessage: "Please enter only numbers",
                                }),
                            },
                        }}
                        placeholder={intl.formatMessage({ id: "contactForm.phoneNumber.placeholder", defaultMessage: "0043123456789" })}
                        label={intl.formatMessage({ id: "contactForm.phoneNumber.label", defaultMessage: "Phone Number" })}
                        helperText={intl.formatMessage({
                            id: "contactForm.phoneNumber.helperText",
                            defaultMessage: "Please enter without special characters and spaces",
                        })}
                    />
                    <SelectField
                        name="subject"
                        control={control}
                        rules={{
                            required: intl.formatMessage({
                                id: "contactForm.subject.required",
                                defaultMessage: "Please select a subject",
                            }),
                        }}
                        label={intl.formatMessage({ id: "contactForm.subject.label", defaultMessage: "Subject" })}
                        placeholder={intl.formatMessage({ id: "contactForm.subject.placeholder", defaultMessage: "Please select" })}
                        options={subjectOptions}
                    />
                    <TextareaField
                        name="message"
                        control={control}
                        rules={{
                            required: intl.formatMessage({
                                id: "contactForm.message.required",
                                defaultMessage: "Please enter your message",
                            }),
                        }}
                        placeholder={intl.formatMessage({ id: "contactForm.message.placeholder", defaultMessage: "Your message" })}
                        label={intl.formatMessage({ id: "contactForm.message.label", defaultMessage: "Message" })}
                    />
                    <FileUploadField
                        name="attachments"
                        control={control}
                        accept={acceptedFileTypes.join(",")}
                        label={intl.formatMessage({ id: "contactForm.attachments.label", defaultMessage: "Attachments" })}
                        validateFile={(file) => {
                            if (file.size > maxFileSizeBytes) {
                                return intl.formatMessage({
                                    id: "contactForm.attachments.tooLarge",
                                    defaultMessage: "File is too large.",
                                });
                            }
                            return undefined;
                        }}
                    />
                    <CheckboxField
                        name="privacyConsent"
                        control={control}
                        rules={{
                            required: intl.formatMessage({
                                id: "contactForm.privacyConsent.required",
                                defaultMessage: "You must agree to the privacy policy to continue",
                            }),
                        }}
                        label={intl.formatMessage({
                            id: "contactForm.privacyConsent.label",
                            defaultMessage:
                                "I agree that my information from the contact form will be collected and processed to answer my inquiry. Note: You can revoke your consent at any time by email to hello@your-domain.com. For more information, please see our privacy policy.",
                        })}
                    />
                    <Button type="submit" variant="contained" disabled={isSubmitting || isUploading}>
                        <FormattedMessage id="contactForm.submitButton.label" defaultMessage="Submit" />
                    </Button>
                    {errors.root?.serverError && <div>{errors.root.serverError.message}</div>}
                    <Typography variant="paragraph200" bottomSpacing>
                        <FormattedMessage
                            id="contactForm.recaptchaDisclaimer"
                            defaultMessage="This site is protected by reCAPTCHA and the Google <privacyLink>Privacy Policy</privacyLink> and <termsLink>Terms of Service</termsLink> apply."
                            values={{
                                privacyLink: (chunks) => <a href="https://policies.google.com/privacy">{chunks}</a>,
                                termsLink: (chunks) => <a href="https://policies.google.com/terms">{chunks}</a>,
                            }}
                        />
                    </Typography>
                </form>
            </PageLayout>
        );
    },
    { label: "Contact Form" },
);
