---
"@dextinity/mail-react": minor
"@dextinity/site-react": minor
---

Make mail blocks selectable in the admin's block preview

Mail blocks now work in the block preview like site blocks: a hover highlights them, and a click opens their form. The sent mail does not change.

Wrap each mail block in `withPreview` and apply the `className` it passes to the block's root element:

```tsx
export const MailButtonBlock = withPreview<PropsWithData<MailButtonBlockData>>(
    ({ data, className }) => (
        <MjmlSection className={className}>
            <MjmlColumn>
                <MjmlButton href={data.link.targetUrl}>{data.text}</MjmlButton>
            </MjmlColumn>
        </MjmlSection>
    ),
    { label: "Button" },
);
```

Pass the block's props as the type argument of `withPreview`, as in `withPreview<PropsWithData<MailButtonBlockData>>`, and it adds the `className` to them.

In the block preview page, pass the result of `useIFrameBridge` to `useRefToRegisterMailBlocksForPreview`, and put the ref it returns on the element that contains the mail HTML:

```tsx
const mailContainerRef = useRefToRegisterMailBlocksForPreview<HTMLSpanElement>(useIFrameBridge());

return <span ref={mailContainerRef} dangerouslySetInnerHTML={{ __html: mailHtml }} />;
```
