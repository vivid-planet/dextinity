import { Field, FinalFormInput } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

import type { PhoneLinkBlockData, PhoneLinkBlockInput } from "../blocks.generated";
import { isPhoneNumber } from "../validation/isPhoneNumber";
import { validatePhoneNumber } from "../validation/validatePhoneNumber";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "./types";

export const PhoneLinkBlock: BlockInterface<PhoneLinkBlockData, PhoneLinkBlockData, PhoneLinkBlockInput> = {
    ...createBlockSkeleton(),

    name: "PhoneLink",

    displayName: <FormattedMessage id="dextinity.blocks.link.phone" defaultMessage="Phone Number" />,

    defaultValues: () => ({ phone: undefined }),

    category: BlockCategory.Navigation,

    isValid: (state) => {
        return state.phone ? isPhoneNumber(state.phone) : true;
    },

    AdminComponent: ({ state, updateState }) => {
        return (
            <SelectPreviewComponent>
                <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                    <Field
                        label={<FormattedMessage id="dextinity.blocks.link.phone" defaultMessage="Phone Number" />}
                        name="phone"
                        component={FinalFormInput}
                        fullWidth
                        validate={validatePhoneNumber}
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },

    previewContent: (state) => {
        return state.phone ? [{ type: "text", content: state.phone }] : [];
    },

    extractTextContents: (state) => {
        return state.phone ? [state.phone] : [];
    },
};
