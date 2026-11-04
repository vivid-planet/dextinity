import { Field, FinalFormInput } from "@dextinity/admin";
import { FormattedMessage, useIntl } from "react-intl";

import type { SpaceBlockData, SpaceBlockInput } from "../blocks.generated";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import { BlockCategory, type BlockInterface } from "./types";

type State = SpaceBlockData;

const isHeightValid = (h: number) => h <= 1000;

const DEFAULT_HEIGHT = 100;

/** @deprecated The `SpaceBlock` is deprecated. It will be removed in the next major version. Use createSpaceBlock instead. */
export const SpaceBlock: BlockInterface<SpaceBlockData, State, SpaceBlockInput> = {
    ...createBlockSkeleton(),

    name: "Space",

    displayName: <FormattedMessage id="dextinity.blocks.space" defaultMessage="Space" />,

    defaultValues: () => ({ height: DEFAULT_HEIGHT }),

    category: BlockCategory.Layout,

    createPreviewState: (state, previewContext) => ({
        ...(SpaceBlock.isValid(state) ? state : SpaceBlock.defaultValues()),
        adminMeta: { route: previewContext.parentUrl },
    }),
    isValid: (state) => isHeightValid(state.height),

    AdminComponent: ({ state, updateState }) => {
        const intl = useIntl();

        return (
            <SelectPreviewComponent>
                <BlocksFinalForm onSubmit={updateState} initialValues={state}>
                    <Field
                        validate={(v) => {
                            if (!isHeightValid(v)) {
                                return intl.formatMessage(
                                    {
                                        id: "dextinity.blocks.space.validationError",
                                        defaultMessage: "The maximum height is {limit, number}px",
                                    },
                                    { limit: 1000 },
                                );
                            }
                        }}
                        label={<FormattedMessage id="dextinity.blocks.space.height" defaultMessage="Height" />}
                        name="height"
                        type="number"
                        required
                        component={FinalFormInput}
                        parse={(v: string) => (v ? Number(v) : 0)}
                        fullWidth
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },

    previewContent: ({ height }) => {
        return [{ type: "text", content: `${height}px` }];
    },

    extractTextContents: () => [],
};
