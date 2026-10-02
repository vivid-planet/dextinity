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
     * Must match the name of the API block this is paired with.
     * @default "ExternalLink"
     */
    name?: string;
}

type OptionValue<Options, Option extends ExternalLinkBlockOption> = Option extends keyof Options ? Options[Option] : undefined;

type DisabledOptions<Options> = {
    [Option in ExternalLinkBlockOption]: [OptionValue<Options, Option>] extends [false] ? Option : never;
}[ExternalLinkBlockOption];

/** Options whose value isn't known at compile time, for instance when passed as a `boolean` variable. */
type UndecidedOptions<Options> = {
    [Option in ExternalLinkBlockOption]: [OptionValue<Options, Option>] extends [false]
        ? never
        : false extends OptionValue<Options, Option>
          ? Option
          : never;
}[ExternalLinkBlockOption];

type WithOptions<T, Options> = Omit<T, DisabledOptions<Options> | UndecidedOptions<Options>> & Partial<Pick<T, UndecidedOptions<Options> & keyof T>>;

export type ExternalLinkBlockState = WithOptions<ExternalLinkBlockData, ExternalLinkBlockFactoryOptions>;

type ExternalLinkBlock<Options = ExternalLinkBlockFactoryOptions> = BlockInterface<
    ExternalLinkBlockData,
    WithOptions<ExternalLinkBlockData, Options>,
    WithOptions<ExternalLinkBlockInput, Options>
> &
    LinkBlockInterface<WithOptions<ExternalLinkBlockData, Options>>;

const allOptions: ExternalLinkBlockOption[] = ["openInNewWindow", "noFollow"];

export function createExternalLinkBlock<const Options extends ExternalLinkBlockFactoryOptions = Record<never, never>>(
    options?: Options,
    override?: (block: ExternalLinkBlock<Options>) => ExternalLinkBlock<Options>,
): ExternalLinkBlock<Options> {
    const { name = "ExternalLink" }: ExternalLinkBlockFactoryOptions = options ?? {};
    const fields = allOptions.filter((option) => options?.[option] !== false);

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
                        {fields.includes("openInNewWindow") && (
                            <CheckboxField
                                label={<FormattedMessage id="dextinity.blocks.link.external.openInNewWindow" defaultMessage="Open in new window" />}
                                name="openInNewWindow"
                            />
                        )}
                        {fields.includes("noFollow") && (
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

    // The fields are filtered at runtime by the same options that ExternalLinkBlock<Options> filters at compile time
    const block = ExternalLinkBlock as unknown as ExternalLinkBlock<Options>;

    if (override) {
        return override(block);
    }

    return block;
}
