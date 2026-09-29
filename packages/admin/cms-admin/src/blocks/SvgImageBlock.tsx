import { gql } from "@apollo/client";
import { Field } from "@dextinity/admin";
import { deepClone } from "@mui/x-data-grid/internals";
import { FormattedMessage } from "react-intl";

import type { SvgImageBlockData, SvgImageBlockInput } from "../blocks.generated";
import { useDextinityConfig } from "../config/DextinityConfigContext";
import { useDamAcceptedMimeTypes } from "../dam/config/useDamAcceptedMimeTypes";
import { FileField } from "../form/file/FileField";
import { BlocksFinalForm } from "./form/BlocksFinalForm";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import { SelectPreviewComponent } from "./iframebridge/SelectPreviewComponent";
import type { GQLSvgImageBlockDamFileQuery, GQLSvgImageBlockDamFileQueryVariables } from "./SvgImageBlock.generated";
import { BlockCategory, type BlockDependency, type BlockInterface } from "./types";

type SvgImageBlockState = Omit<SvgImageBlockData, "urlTemplate">;

function createPreviewUrl({ damFile }: SvgImageBlockState, { apiUrl }: { apiUrl: string }): string {
    if (!damFile) {
        return "";
    }
    return `${apiUrl}${damFile.fileUrl}`;
}

export const SvgImageBlock: BlockInterface<SvgImageBlockData, SvgImageBlockState, SvgImageBlockInput> = {
    ...createBlockSkeleton(),

    name: "SVG",

    displayName: <FormattedMessage id="dextinity.blocks.svgImage" defaultMessage="SVG" />,

    defaultValues: () => ({}),

    category: BlockCategory.Media,

    createPreviewState: (state, previewContext) => {
        return {
            ...state,
            damFile: state.damFile
                ? {
                      ...state.damFile,
                      fileUrl: createPreviewUrl(state, { apiUrl: previewContext.apiUrl }),
                  }
                : undefined,
            adminMeta: { route: previewContext.parentUrl },
        };
    },

    state2Output: (v) => {
        if (!v.damFile) {
            return {};
        }
        return {
            damFileId: v.damFile.id,
        };
    },

    output2State: async (output, { apolloClient }): Promise<SvgImageBlockState> => {
        if (!output.damFileId) {
            return {};
        }

        const { data } = await apolloClient.query<GQLSvgImageBlockDamFileQuery, GQLSvgImageBlockDamFileQueryVariables>({
            query: gql`
                query SvgImageBlockDamFile($id: ID!) {
                    damFile(id: $id) {
                        id
                        name
                        size
                        mimetype
                        contentHash
                        title
                        altText
                        archived
                        fileUrl
                    }
                }
            `,
            variables: { id: output.damFileId },
        });

        // TODO consider throwing an error
        // TODO fix typing: generated GraphQL files use null, we use undefined, e.g. title: string | null vs title?: string
        const damFile = data.damFile as unknown as SvgImageBlockData["damFile"];

        return { damFile };
    },

    dependencies: (state) => {
        const dependencies: BlockDependency[] = [];

        if (state.damFile?.id) {
            dependencies.push({
                targetGraphqlObjectType: "DamFile",
                id: state.damFile.id,
                data: {
                    damFile: state.damFile,
                },
            });
        }

        return dependencies;
    },

    replaceDependenciesInOutput: (output, replacements) => {
        const clonedOutput: SvgImageBlockInput = deepClone(output);
        const replacement = replacements.find((replacement) => replacement.type === "DamFile" && replacement.originalId === output.damFileId);

        if (replacement) {
            clonedOutput.damFileId = replacement.replaceWithId;
        }

        return clonedOutput;
    },

    definesOwnPadding: true,

    AdminComponent: ({ state, updateState }) => {
        const { apiUrl } = useDextinityConfig();
        const { filteredAcceptedMimeTypes } = useDamAcceptedMimeTypes();

        const previewUrl = createPreviewUrl(state, { apiUrl });

        return (
            <SelectPreviewComponent>
                <BlocksFinalForm<{ damFile?: SvgImageBlockState["damFile"] }>
                    onSubmit={(newValues) => {
                        updateState((prevState) => ({ ...prevState, damFile: newValues.damFile || undefined }));
                    }}
                    initialValues={{ damFile: state.damFile }}
                >
                    <Field
                        name="damFile"
                        component={FileField}
                        fullWidth
                        buttonText={<FormattedMessage id="dextinity.blocks.image.chooseImage" defaultMessage="Choose image" />}
                        allowedMimetypes={filteredAcceptedMimeTypes.svgImage}
                        preview={<img src={previewUrl} width="70" height="70" />}
                    />
                </BlocksFinalForm>
            </SelectPreviewComponent>
        );
    },
    previewContent: (state, context) => {
        if (!state.damFile || !state.damFile?.fileUrl || !context?.apiUrl) {
            return [];
        }
        return [
            {
                type: "image",
                content: { src: createPreviewUrl(state, { apiUrl: context.apiUrl }), width: 320, height: 320 },
            },
            { type: "text", content: state.damFile.name },
        ];
    },
    extractTextContents: (state) => {
        const contents = [];

        if (state.damFile?.altText) {
            contents.push(state.damFile.altText);
        }
        if (state.damFile?.title) {
            contents.push(state.damFile.title);
        }

        return contents;
    },
};
