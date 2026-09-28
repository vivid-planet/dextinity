import { CheckboxField, Field, FinalFormInput } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

import type { ExternalLinkBlockData, ExternalLinkBlockInput } from "../blocks.generated";
import { isLinkTarget } from "../validation/isLinkTarget";
import { validateLinkTarget } from "../validation/validateLinkTarget";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "./types";

type State = ExternalLinkBlockData;

export const ExternalLinkBlock: BlockInterface<ExternalLinkBlockData, State, ExternalLinkBlockInput> & LinkBlockInterface<State> = {
    ...createBlockSkeleton(),

    name: "ExternalLink",

    displayName: <FormattedMessage id="dextinity.blocks.externalLink" defaultMessage="External Link" />,

    defaultValues: () => ({ targetUrl: undefined, openInNewWindow: false, noFollow: false }),

    category: BlockCategory.Navigation,

    input2State: (state) => {
        return state;
    },

    state2Output: (state) => {
        return {
            targetUrl: state.targetUrl,
            openInNewWindow: state.openInNewWindow,
            noFollow: state.noFollow,
        };
    },

    output2State: async (output) => {
        return {
            targetUrl: output.targetUrl,
            openInNewWindow: output.openInNewWindow,
            noFollow: output.noFollow,
        };
    },

    isValid: (state) => {
        return state.targetUrl ? isLinkTarget(state.targetUrl) : true;
    },

    url2State: (url) => {
        if (isLinkTarget(url)) {
            return {
                targetUrl: url,
                openInNewWindow: false,
                noFollow: false,
            };
        }

        return false;
    },

    AdminComponent: ({ state, updateState }) => {
        return (
            <SelectPreviewComponent>
                <BlocksFinalForm
                    onSubmit={(newState) => {
                        updateState(newState);
                    }}
                    initialValues={state}
                >
                    <Field
                        label={<FormattedMessage id="dextinity.blocks.link.external.targetUrl" defaultMessage="URL" />}
                        name="targetUrl"
                        component={FinalFormInput}
                        fullWidth
                        validate={(url) => validateLinkTarget(url)}
                        disableContentTranslation
                    />
                    <CheckboxField
                        label={<FormattedMessage id="dextinity.blocks.link.external.openInNewWindow" defaultMessage="Open in new window" />}
                        name="openInNewWindow"
                    />
                    <CheckboxField
                        label={<FormattedMessage id="dextinity.blocks.link.external.noFollow" defaultMessage="No follow" />}
                        name="noFollow"
                        helperText={
                            <FormattedMessage
                                id="dextinity.blocks.link.external.noFollow.helperText"
                                defaultMessage='Adds rel="nofollow" to the link, telling search engines not to follow it. Use for sponsored, paid, user-generated or untrusted links so that no SEO authority is passed to the target.'
                            />
                        }
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },
    previewContent: (state) => {
        return state.targetUrl ? [{ type: "text", content: state.targetUrl }] : [];
    },

    extractTextContents: (state) => (state.targetUrl ? [state.targetUrl] : []),
};
