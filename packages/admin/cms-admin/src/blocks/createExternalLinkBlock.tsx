import { CheckboxField, Field, FinalFormInput } from "@dextinity/admin";
import { FormattedMessage } from "react-intl";

import type { ExternalLinkBlockData, ExternalLinkBlockInput } from "../blocks.generated";
import { isLinkTarget } from "../validation/isLinkTarget";
import { validateLinkTarget } from "../validation/validateLinkTarget";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface, type LinkBlockInterface } from "./types";

type ExternalLinkBlockOption = "openInNewWindow" | "noFollow";

/** The options are optional because a block whose `fields` leave one out doesn't carry it at all. */
type WithOptionalOptions<T extends Record<ExternalLinkBlockOption, boolean>> = Omit<T, ExternalLinkBlockOption> &
    Partial<Pick<T, ExternalLinkBlockOption>>;

export type ExternalLinkBlockState = WithOptionalOptions<ExternalLinkBlockData>;

type State = ExternalLinkBlockState;

type Output = WithOptionalOptions<ExternalLinkBlockInput>;

type ExternalLinkBlock = BlockInterface<ExternalLinkBlockData, State, Output> & LinkBlockInterface<State>;

const allOptions: ExternalLinkBlockOption[] = ["openInNewWindow", "noFollow"];

interface ExternalLinkBlockFactoryOptions {
    /**
     * Which options the block's data has besides the URL. Must match the API block this is paired with:
     * sending a field the API block doesn't have is rejected by validation, and so is omitting one it has.
     * Leave this alone unless you paired the block with an API block created by `createExternalLinkBlock`
     * from `@dextinity/cms-api` — the `ExternalLinkBlock` shipped by the API has all of them.
     * @default ["openInNewWindow", "noFollow"]
     */
    fields?: ExternalLinkBlockOption[];
    /**
     * Which of those options the editor can set. Leave out anything that has no meaning where the block is
     * used, for instance `[]` for redirects, where neither option affects the resulting HTTP redirect.
     *
     * Values that are already stored are kept as they are, the editor just can't change them anymore.
     * A field left out here stays part of the block's data, so the API block and the site component are
     * unaffected. It also keeps its default, it isn't forced to a different value — to always open external
     * links in a new tab, do so in the site implementation instead.
     *
     * Must be a subset of `fields`: the editor can't set an option the block doesn't have.
     * @default the value of `fields`
     */
    supports?: ExternalLinkBlockOption[];
    /**
     * The block's name. Must match the name of the API block this is paired with, so only change it
     * together with `fields` for a block created by `createExternalLinkBlock` from `@dextinity/cms-api`.
     * @default "ExternalLink"
     */
    name?: string;
}

export function createExternalLinkBlock(
    { fields = allOptions, supports = fields, name = "ExternalLink" }: ExternalLinkBlockFactoryOptions = {},
    override?: (block: ExternalLinkBlock) => ExternalLinkBlock,
): ExternalLinkBlock {
    const unsupportedFields = supports.filter((option) => !fields.includes(option));

    if (unsupportedFields.length > 0) {
        throw new Error(
            `The ${name} block can't let the editor set ${unsupportedFields.join(", ")}, as it isn't part of its fields. Add it to "fields" or remove it from "supports".`,
        );
    }

    const has = (option: ExternalLinkBlockOption) => fields.includes(option);
    const ExternalLinkBlock: ExternalLinkBlock = {
        ...createBlockSkeleton(),

        name,

        displayName: <FormattedMessage id="dextinity.blocks.externalLink" defaultMessage="External Link" />,

        defaultValues: () => ({
            targetUrl: undefined,
            ...(has("openInNewWindow") ? { openInNewWindow: false } : {}),
            ...(has("noFollow") ? { noFollow: false } : {}),
        }),

        category: BlockCategory.Navigation,

        input2State: (state) => {
            return state;
        },

        state2Output: (state) => {
            return {
                targetUrl: state.targetUrl,
                ...(has("openInNewWindow") ? { openInNewWindow: state.openInNewWindow } : {}),
                ...(has("noFollow") ? { noFollow: state.noFollow } : {}),
            };
        },

        output2State: async (output) => {
            return {
                targetUrl: output.targetUrl,
                ...(has("openInNewWindow") ? { openInNewWindow: output.openInNewWindow } : {}),
                ...(has("noFollow") ? { noFollow: output.noFollow } : {}),
            };
        },

        isValid: (state) => {
            return state.targetUrl ? isLinkTarget(state.targetUrl) : true;
        },

        url2State: (url) => {
            if (isLinkTarget(url)) {
                return {
                    targetUrl: url,
                    ...(has("openInNewWindow") ? { openInNewWindow: false } : {}),
                    ...(has("noFollow") ? { noFollow: false } : {}),
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
                        {supports.includes("openInNewWindow") && (
                            <CheckboxField
                                label={<FormattedMessage id="dextinity.blocks.link.external.openInNewWindow" defaultMessage="Open in new window" />}
                                name="openInNewWindow"
                            />
                        )}
                        {supports.includes("noFollow") && (
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
                        )}
                    </BlocksFinalForm>
                </SelectPreviewComponent>
            );
        },
        previewContent: (state) => {
            return state.targetUrl ? [{ type: "text", content: state.targetUrl }] : [];
        },

        extractTextContents: (state) => (state.targetUrl ? [state.targetUrl] : []),
    };

    if (override) {
        return override(ExternalLinkBlock);
    }

    return ExternalLinkBlock;
}
