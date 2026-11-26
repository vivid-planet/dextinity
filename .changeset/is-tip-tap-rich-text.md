---
"@dextinity/cms-api": minor
---

Add `IsTipTapRichText` to validate TipTap rich text outside of blocks

Use it in the input of content stored by `TipTapRichTextEditorField` in the Admin, e.g. a JSON property of an entity. It takes the same options as `createTipTapRichTextBlock`, except that `link` is a class that validates a link's data. Type the property with `TipTapRichTextContent`:

```ts
class UrlLinkData {
    @IsUrl()
    url: string;
}

@InputType()
export class ManufacturerInput {
    @IsNullable()
    @IsTipTapRichText({ link: UrlLinkData })
    @Field(() => GraphQLJSONObject, { nullable: true })
    description?: TipTapRichTextContent;
}
```
