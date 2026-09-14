import { Field, FinalFormInput } from "@dextinity/admin";
import { isEmail } from "class-validator";
import { FormattedMessage } from "react-intl";

import type { EmailLinkBlockData, EmailLinkBlockInput } from "../blocks.generated";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "./types";

export const EmailLinkBlock: BlockInterface<EmailLinkBlockData, EmailLinkBlockData, EmailLinkBlockInput> = {
    ...createBlockSkeleton(),

    name: "EmailLink",

    displayName: <FormattedMessage id="dextinity.blocks.link.email" defaultMessage="Email" />,

    defaultValues: () => ({ email: undefined }),

    category: BlockCategory.Navigation,

    isValid: (state) => {
        return state.email ? isEmail(state.email) : true;
    },

    AdminComponent: ({ state, updateState }) => {
        return (
            <SelectPreviewComponent>
                <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                    <Field
                        label={<FormattedMessage id="dextinity.blocks.link.email" defaultMessage="Email" />}
                        name="email"
                        component={FinalFormInput}
                        fullWidth
                        validate={(email: string) => {
                            if (email && !isEmail(email)) {
                                return <FormattedMessage id="dextinity.blocks.link.email.invalid" defaultMessage="Invalid e-mail address" />;
                            }
                        }}
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },

    previewContent: (state) => {
        return state.email ? [{ type: "text", content: state.email }] : [];
    },

    extractTextContents: (state) => {
        return state.email ? [state.email] : [];
    },
};
