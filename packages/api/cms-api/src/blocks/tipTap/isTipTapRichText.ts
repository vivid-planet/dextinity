import { getSchema } from "@tiptap/core";
import { type ClassConstructor, plainToInstance } from "class-transformer";
import { registerDecorator, validate, type ValidationOptions } from "class-validator";

import {
    buildExtensions,
    createTipTapContentValidator,
    type CreateTipTapRichTextBlockOptions,
    resolveTipTapOptions,
} from "./createTipTapRichTextBlock.js";

export interface IsTipTapRichTextOptions extends Omit<
    CreateTipTapRichTextBlockOptions,
    "link" | "childBlocks" | "indexSearchText" | "migrateFromDraftJs"
> {
    /**
     * Enables links by passing the class that validates a link's data, e.g. a class with an `@IsUrl()`
     * property. Its properties must be decorated with class-validator decorators, since other
     * properties are rejected. Disabled by default.
     *
     * Must match the Admin's `link`, otherwise the API rejects content the editor produces.
     */
    link?: ClassConstructor<object>;
}

/**
 * Validates TipTap JSON content stored outside of a block, e.g. by `TipTapRichTextEditorField` in the Admin.
 *
 * The options must match the Admin's, otherwise the API rejects content the editor produces.
 */
export function IsTipTapRichText(options: IsTipTapRichTextOptions = {}, validationOptions?: ValidationOptions) {
    const { link: LinkData, inlineStyles = [], placeholders = [], maxTextBlocks, listLevelMax } = options;
    const resolvedOptions = { ...resolveTipTapOptions({ ...options, link: undefined }), link: !!LinkData };
    const schema = getSchema(
        buildExtensions({ resolvedOptions, inlineStyles, placeholders, hasBlockChildBlocks: false, hasInlineChildBlocks: false }),
    );

    const isValidTipTapContent = createTipTapContentValidator(schema, {
        inlineStyles,
        isValidLinkData: LinkData
            ? async (data) => {
                  const validationErrors = await validate(plainToInstance(LinkData, data), { forbidNonWhitelisted: true, whitelist: true });
                  return validationErrors.length === 0;
              }
            : undefined,
        maxTextBlocks,
        allowedPlaceholderNames: placeholders.length > 0 ? placeholders.map((placeholder) => placeholder.name) : undefined,
        listLevelMax,
        textBlocks: resolvedOptions.textBlocks,
        defaultTextBlock: resolvedOptions.defaultTextBlock,
        orderedList: resolvedOptions.orderedList,
        unorderedList: resolvedOptions.unorderedList,
        textAlign: resolvedOptions.textAlign,
    });

    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isTipTapRichText",
            target: object.constructor,
            propertyName,
            options: { message: "$property must be valid TipTap JSON content", ...validationOptions },
            validator: { validate: isValidTipTapContent },
        });
    };
}
