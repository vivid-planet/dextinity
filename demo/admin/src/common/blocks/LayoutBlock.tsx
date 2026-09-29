import { Field } from "@dextinity/admin";
import { Hamburger, Image } from "@dextinity/admin-icons";
import {
    BlockCategory,
    BlocksFinalForm,
    type ColumnsBlockLayout,
    ColumnsLayoutPreview,
    ColumnsLayoutPreviewContent,
    ColumnsLayoutPreviewSpacing,
    createCompositeBlock,
    createCompositeBlockField,
    FinalFormLayoutSelect,
} from "@dextinity/cms-admin";
import type { LayoutBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

import { MediaBlock } from "./MediaBlock";

const layoutOptions: (ColumnsBlockLayout & { visibleBlocks: string[] })[] = [
    {
        name: "layout1",
        label: <FormattedMessage id="layoutBlock.layout.layout1" defaultMessage="Layout 1" />,
        columns: 3,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={10} label={<Image />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={7} label={<Hamburger />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={7} label={<Image />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "media1", "text1", "media2"],
    },
    {
        name: "layout2",
        label: <FormattedMessage id="layoutBlock.layout.layout2" defaultMessage="Layout 2" />,
        columns: 3,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={7} label={<Hamburger />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={10} label={<Image />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={7} label={<Hamburger />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "text1", "media1", "text2"],
    },
    {
        name: "layout3",
        label: <FormattedMessage id="layoutBlock.layout.layout3" defaultMessage="Layout 3" />,
        columns: 3,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={6} label={<Image />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={6} label={<Hamburger />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={12} label={<Image />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "media1", "text1", "media2"],
    },
    {
        name: "layout4",
        label: <FormattedMessage id="layoutBlock.layout.layout4" defaultMessage="Layout 4" />,
        columns: 2,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={14} label={<Image />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={10} label={<Hamburger />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "media1", "text1"],
    },
    {
        name: "layout5",
        label: <FormattedMessage id="layoutBlock.layout.layout5" defaultMessage="Layout 5" />,
        columns: 2,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={10} label={<Hamburger />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={14} label={<Image />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "text1", "media1"],
    },
    {
        name: "layout6",
        label: <FormattedMessage id="layoutBlock.layout.layout6" defaultMessage="Layout 6" />,
        columns: 2,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={12} label={<Image />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={12} label={<Hamburger />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "media1", "text1"],
    },
    {
        name: "layout7",
        label: <FormattedMessage id="layoutBlock.layout.layout7" defaultMessage="Layout 7" />,
        columns: 2,
        preview: (
            <ColumnsLayoutPreview>
                <ColumnsLayoutPreviewContent width={12} label={<Hamburger />} />
                <ColumnsLayoutPreviewSpacing width={1} />
                <ColumnsLayoutPreviewContent width={12} label={<Image />} />
            </ColumnsLayoutPreview>
        ),
        visibleBlocks: ["layout", "text1", "media1"],
    },
];

export const LayoutBlock = createCompositeBlock(
    {
        name: "Layout",
        displayName: <FormattedMessage id="layoutBlock.displayName" defaultMessage="Layout" />,
        visibleOrderedBlocksForState: (state: LayoutBlockData) => layoutOptions.find((option) => option.name === state.layout)?.visibleBlocks,
        blocks: {
            layout: {
                block: createCompositeBlockField<LayoutBlockData["layout"]>({
                    defaultValue: "layout1",
                    AdminComponent: ({ state, updateState }) => (
                        <BlocksFinalForm<{ layout: ColumnsBlockLayout }>
                            onSubmit={({ layout }) => updateState(layout.name as LayoutBlockData["layout"])}
                            initialValues={{ layout: layoutOptions.find((layout) => layout.name === state) }}
                        >
                            <Field name="layout" component={FinalFormLayoutSelect} layouts={layoutOptions} fullWidth />
                        </BlocksFinalForm>
                    ),
                    extractTextContents: () => [],
                }),
                title: <FormattedMessage id="layoutBlock.layout" defaultMessage="Layout" />,
            },
            media1: {
                block: MediaBlock,
                title: <FormattedMessage id="layoutBlock.media1" defaultMessage="Media 1" />,
            },
            text1: {
                block: RichTextBlock,
                title: <FormattedMessage id="layoutBlock.text1" defaultMessage="Text 1" />,
            },
            media2: {
                block: MediaBlock,
                title: <FormattedMessage id="layoutBlock.media2" defaultMessage="Media 2" />,
            },
            text2: {
                block: RichTextBlock,
                title: <FormattedMessage id="layoutBlock.text2" defaultMessage="Text 2" />,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Layout;
        return block;
    },
);
