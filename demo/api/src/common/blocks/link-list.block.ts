import { BaseListBlockItemData, BaseListBlockItemInput, BlockField, createListBlock } from "@dextinity/cms-api";
import { UserGroup } from "@src/user-groups/user-group.js";
import { IsEnum } from "class-validator";

import { TextLinkBlock } from "./text-link.block.js";

class ListBlockItemData extends BaseListBlockItemData(TextLinkBlock) {
    @BlockField({ type: "enum", enum: UserGroup })
    userGroup: UserGroup;
}

class ListBlockItemInput extends BaseListBlockItemInput(TextLinkBlock, ListBlockItemData) {
    @BlockField({ type: "enum", enum: UserGroup })
    @IsEnum(UserGroup)
    userGroup: UserGroup;
}

export const LinkListBlock = createListBlock({ block: TextLinkBlock, ListBlockItemData, ListBlockItemInput }, "LinkList");
