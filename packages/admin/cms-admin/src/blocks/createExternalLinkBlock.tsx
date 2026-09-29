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

/** The options are optional because a block of its own doesn't carry the ones it disables at all. */
type WithOptionalOptions<T extends Record<ExternalLinkBlockOption, boolean>> = Omit<T, ExternalLinkBlockOption> &
    Partial<Pick<T, ExternalLinkBlockOption>>;

export type ExternalLinkBlockState = WithOptionalOptions<ExternalLinkBlockData>;

type State = ExternalLinkBlockState;

type Output = WithOptionalOptions<ExternalLinkBlockInput>;

type ExternalLinkBlock = BlockInterface<ExternalLinkBlockData, State, Output> & LinkBlockInterface<State>;

/** A block with all fields, as `ExternalLinkBlock` itself, whose options are therefore always present. */
type CompleteExternalLinkBlock = BlockInterface<ExternalLinkBlockData, ExternalLinkBlockData, ExternalLinkBlockInput> &
    LinkBlockInterface<ExternalLinkBlockData>;

const allOptions: ExternalLinkBlockOption[] = ["openInNewWindow", "noFollow"];

interface ExternalLinkBlockFactoryOptions {
    /**
     * Offers "Open in new window". Defaults to `true`.
     */
    openInNewWindow?: boolean;
    /**
     * Offers "No follow". Defaults to `true`.
     */
    noFollow?: boolean;
    /**
     * The block's name. Must match the name of the API block this is paired with.
     *
     * Without a name of its own, the block keeps the name and the data of the `ExternalLinkBlock`, and a disabled
     * option is only hidden from the editor: stored values are kept as they are, the API block and the site component
     * are unaffected. Use that where an option has no meaning, for instance in redirects, where neither affects the
     * resulting HTTP redirect.
     *
     * With a name of its own, the block is paired with an API block created by `createExternalLinkBlock` from
     * `@dextinity/cms-api`, and a disabled option isn't part of its data either. Disable the same options as there:
     * sending a field the API block doesn't have is rejected by validation, and so is omitting one it has.
     * @default "ExternalLink"
     */
    name?: string;
}

/**
 * Creates an external link block that offers only the options that have an effect where it is used.
 */
export function createExternalLinkBlock(
    options?: Omit<ExternalLinkBlockFactoryOptions, "name"> & { name?: "ExternalLink" },
    override?: (block: CompleteExternalLinkBlock) => CompleteExternalLinkBlock,
): CompleteExternalLinkBlock;
export function createExternalLinkBlock(
    options: ExternalLinkBlockFactoryOptions,
    override?: (block: ExternalLinkBlock) => ExternalLinkBlock,
): ExternalLinkBlock;
export function createExternalLinkBlock(
    { name = "ExternalLink", ...options }: ExternalLinkBlockFactoryOptions = {},
    override?: ((block: CompleteExternalLinkBlock) => CompleteExternalLinkBlock) | ((block: ExternalLinkBlock) => ExternalLinkBlock),
): CompleteExternalLinkBlock | ExternalLinkBlock {
    const enabledOptions = allOptions.filter((option) => options[option] !== false);
    // The ExternalLink name promises the data of the ExternalLinkBlock, which the block clipboard relies on when
    // deciding whether copied content fits where it is pasted
    const fields = name === "ExternalLink" ? allOptions : enabledOptions;

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
                        {enabledOptions.includes("openInNewWindow") && (
                            <CheckboxField
                                label={<FormattedMessage id="dextinity.blocks.link.external.openInNewWindow" defaultMessage="Open in new window" />}
                                name="openInNewWindow"
                            />
                        )}
                        {enabledOptions.includes("noFollow") && (
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
        // Without a name of its own, the block has all fields, which is what the overload for a complete block relies on
        return (override as (block: ExternalLinkBlock) => ExternalLinkBlock)(ExternalLinkBlock);
    }

    return ExternalLinkBlock;
}
