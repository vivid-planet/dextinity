import { BlockMigration, type BlockMigrationInterface, type TipTapRichTextBlockContent } from "@dextinity/cms-api";

interface From {
    tipTapContent: TipTapRichTextBlockContent;
}

type To = From;

// The block's own migrations run after Dextinity's, so the nodes have their current shape here
// whatever they were stored as.
function changeHeading1ToHeading2(node: TipTapRichTextBlockContent): TipTapRichTextBlockContent {
    let result = node;
    if (node.type === "textBlock" && node.attrs?.textBlock === "heading-1") {
        result = { ...node, attrs: { ...node.attrs, textBlock: "heading-2" } };
    }
    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map(changeHeading1ToHeading2) };
    }
    return result;
}

export class Heading1ToHeading2Migration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(from: From): To {
        return { tipTapContent: changeHeading1ToHeading2(from.tipTapContent) };
    }
}
