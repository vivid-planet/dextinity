import { BlockMigration, type BlockMigrationInterface, type TipTapRichTextBlockContent } from "@dextinity/cms-api";

interface From {
    tipTapContent: TipTapRichTextBlockContent;
}

type To = From;

// TipTap heading nodes are shaped like `{ type: "heading", attrs: { level: 1 }, content: [...] }`.
// Walk the document tree and bump every level-1 heading to level 2.
function changeHeading1ToHeading2(node: TipTapRichTextBlockContent): TipTapRichTextBlockContent {
    let result = node;
    if (node.type === "heading" && node.attrs?.level === 1) {
        result = { ...node, attrs: { ...node.attrs, level: 2 } };
    }
    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map(changeHeading1ToHeading2) };
    }
    return result;
}

// `toVersion` is 2 because `migrateFromDraftJs` prepends the DraftJS->TipTap migration as version 1.
export class Heading1ToHeading2Migration extends BlockMigration<(from: From) => To> implements BlockMigrationInterface {
    public readonly toVersion = 2;

    protected migrate(from: From): To {
        return { tipTapContent: changeHeading1ToHeading2(from.tipTapContent) };
    }
}
