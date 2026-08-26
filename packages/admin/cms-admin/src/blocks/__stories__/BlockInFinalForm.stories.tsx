import { Field, FinalForm, SaveBoundary } from "@dextinity/admin";

import { BlockAdminComponentRoot } from "../common/BlockAdminComponentRoot";
import { ExternalLinkBlock } from "../ExternalLinkBlock";
import { createListBlock } from "../factories/createListBlock";
import { createFinalFormBlock } from "../form/createFinalFormBlock";

export default {
    title: "blocks/BlockInFinalForm",
};

export const BlockInFinalFormWithSaveBoundary = () => {
    const LinkListBlock = createListBlock({ name: "LinkList", block: ExternalLinkBlock });
    const FinalFormLinkListBlock = createFinalFormBlock(LinkListBlock);

    return (
        <SaveBoundary>
            <FinalForm mode="edit" onSubmit={() => {}} initialValues={{ links: LinkListBlock.defaultValues() }}>
                <BlockAdminComponentRoot>
                    <Field name="links" component={FinalFormLinkListBlock} fullWidth />
                </BlockAdminComponentRoot>
            </FinalForm>
        </SaveBoundary>
    );
};

export const BlockInFinalFormWithoutSaveBoundary = () => {
    const LinkListBlock = createListBlock({ name: "LinkList", block: ExternalLinkBlock });
    const FinalFormLinkListBlock = createFinalFormBlock(LinkListBlock);

    return (
        <FinalForm mode="edit" onSubmit={() => {}} initialValues={{ links: LinkListBlock.defaultValues() }}>
            <BlockAdminComponentRoot>
                <Field name="links" component={FinalFormLinkListBlock} fullWidth />
            </BlockAdminComponentRoot>
        </FinalForm>
    );
};
