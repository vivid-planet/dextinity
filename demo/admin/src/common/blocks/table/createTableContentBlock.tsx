import { type BlockInterface, createTableBlock, type ReadOnlyBlockRenderInterface } from "@dextinity/cms-admin";

const maximumPreviewTextLength = 100;

export function createTableContentBlock<RichText extends BlockInterface & ReadOnlyBlockRenderInterface>({
    richText,
    name,
}: {
    richText: RichText;
    name: string;
}) {
    return createTableBlock({ richText, name }, (block) => ({
        ...block,
        previewContent: (state, context) => {
            const cellTexts = state.rows.flatMap((row) =>
                state.columns.flatMap((column) => {
                    const cellValue = row.cellValues.find((cellValue) => cellValue.columnId === column.id);
                    if (cellValue === undefined) {
                        return [];
                    }
                    return richText
                        .previewContent(cellValue.value, context)
                        .flatMap((previewContent) =>
                            previewContent.type === "text" && typeof previewContent.content === "string" ? [previewContent.content] : [],
                        );
                }),
            );
            const previewText = cellTexts
                .filter((text) => text.length > 0)
                .join(", ")
                .slice(0, maximumPreviewTextLength);

            return previewText.length > 0 ? [{ type: "text", content: previewText }] : [];
        },
    }));
}
