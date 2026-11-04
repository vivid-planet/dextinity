export interface BlockMeta {
    name: string;
    fields: BlockMetaField[];
    inputFields: BlockMetaField[];
}

export type BlockMetaField =
    | {
          name: string;
          kind: "String" | "Number" | "Boolean" | "Json";
          nullable: boolean;
          array?: boolean;
      }
    | {
          name: string;
          kind: "TipTapRichTextBlock";
          nullable: boolean;
          childBlocks: Record<string, string>;
      }
    | {
          name: string;
          kind: "Enum";
          nullable: boolean;
          enum: string[];
          array?: boolean;
      }
    | {
          name: string;
          kind: "Block";
          nullable: boolean;
          block: string;
      }
    | {
          name: string;
          kind: "OneOfBlocks";
          nullable: boolean;
          blocks: Record<string, string>;
      }
    | {
          name: string;
          kind: "NestedObject" | "NestedObjectList";
          nullable: boolean;
          object: BlockMetaNestedObject;
      };

interface BlockMetaNestedObject {
    fields: BlockMetaField[];
}
