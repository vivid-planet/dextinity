# Mail-Templates (experimental)

This module provides a way to create and manage mail-templates. It allows you to create reusable mail-templates that can be used in different parts of your application. The templates are created using React components and rendered to HTML.

**Epic:** https://vivid-planet.atlassian.net/browse/COM-2057

:::tip
`@dextinity/mail-react` lets you build responsive, cross-client-compatible HTML emails using MJML-based React components. For the full theme, component, and customization API, see [Building HTML Emails](../13-building-html-emails/index.md).
:::

## Setup

Add the `MailTemplatesModule` to the imports of your `AppModule`:

```ts title="/api/src/app.module.ts"
imports: [
    // existing imports
    MailTemplatesModule,
];
```

### Using React

If you plan to use React components in the mail template, update your `tsconfig.json` and install the required packages:

```json title="/api/tsconfig.json"
{
    "compilerOptions": {
        "jsx": "react-jsx"
    }
}
```

```json title="/api/package.json"
"dependencies": {
    "@dextinity/mail-react": "...",
    "react": "^18.3.1"
}
```

## Create a mail template class

Create class in the module the mail belongs to, e.g. `api/src/my-module/my-custom.mail.ts`.

- `.mail` is just a convention, not required
- Use `.tsx` if you want to use React components in the mail template

```tsx title="/api/src/my-module/my-custom.mail.tsx"
import { MjmlColumn, MjmlMailRoot, MjmlSection, MjmlText } from "@dextinity/mail-react";
import { renderMailHtml } from "@dextinity/mail-react/server";

@MailTemplate()
export class MyCustomMail implements MailTemplateInterface<MailProps> {
    constructor(private readonly translationService: TranslationService) {} // add dependencies if needed

    async generateMail(props: MailProps) {
        const intl = this.translationService.getIntl();

        const { html, mjmlWarnings } = renderMailHtml(
            <MjmlMailRoot>
                <IntlProvider locale="de" defaultLocale="de" messages={intl.messages}>
                    <MailContent {...props} />
                </IntlProvider>
            </MjmlMailRoot>,
        );

        if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
            console.warn(`${mjmlWarnings.length} MJML Warnings`, mjmlWarnings);
        }

        return {
            to: { name: "John Doe", address: "bh@vivid-planet.com" },
            subject: intl.formatMessage({
                id: "mail-templates.static-mail_my-custom-mail.subject",
                defaultMessage: "My Custom Mail Subject",
            }),
            text: "LOREM IPSUM",
            html,
            attachments: [],
        };
    }

    async getPreparedTestProps() {
        // this is used for styling mail-templates and in admin for testing.
        // it's also possible to access any imported service to generate test-data.
        return [
            {
                props: { ... }, // MailProps
            },
        ];
    }
}

export type MailProps = { ... }; // define props required to generate/render the mail

const MailContent = ({ recipient }: MailProps) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlText>
                    {recipient.name} LOREM IPSUM
                    <FormattedMessage id="mail-templates.static-mail_my-custom-mail.introHeadline" defaultMessage="Intro Headline" />
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    );
}
```

## Register the mail template class

Register the mail template class in the module it belongs to, required for debug-tools to find the mail-template

```ts title="/api/src/my-module/my-module.module.ts"
providers: [
    // existing providers
    MyCustomMail,
];
```

## Use MailTemplate

```ts title="/api/src/my-module/my-service.ts"
import { MyCustomMail } from "@src/my-module/my-custom-mail/my-custom.mail.ts";

@Injectable()
export class MyService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly myCustomMail: MyCustomMail,
    ) {}

    async sendMail() {
        await this.mailerService.sendMail({
            ...(await this.myCustomMail.generateMail({ ... })), // MailProps
        });
    }
}
```

## Send a test-mail

```shell
# npm run console mail-template:test [mailTemplateClassName] [preparedTestPropsIndex]
npm run console mail-template:test MyCustomMail 0
```
