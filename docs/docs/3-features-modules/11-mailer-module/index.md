# Mailer Module

## Project-Setup

Add the following to the existing files of your project:

```ts title="/api/src/config/environment-variables.ts"
@IsString()
MAILER_HOST: string;

@Type(() => Number)
@IsInt()
MAILER_PORT: number;

@IsUndefinable()
@IsArray()
@Transform(({ value }) => value.split(","))
@IsEmail({}, { each: true })
MAILER_SEND_ALL_MAILS_TO?: string[];

@IsUndefinable()
@IsArray()
@Transform(({ value }) => value.split(","))
@IsEmail({}, { each: true })
MAILER_SEND_ALL_MAILS_BCC?: string[];
```

```ts title="/api/src/config/config.ts"
mailer: {
    // Mailer configuration
    defaultFrom: '"Dextinity Demo" <dextinity-demo@dextinity.com>',
    sendAllMailsTo: envVars.MAILER_SEND_ALL_MAILS_TO,
    sendAllMailsBcc: envVars.MAILER_SEND_ALL_MAILS_BCC,

    daysToKeepMailLog: 90,

    transport: { // nodemailer configuration
        host: envVars.MAILER_HOST,
        port: envVars.MAILER_PORT,
    }
},
```

```yaml title="/docker-compose.yml"
services:
    # ... existing services
    mailpit:
        image: axllent/mailpit
        pull_policy: weekly
        ports:
            - "127.0.0.1:1025:1025" # SMTP server
            - "127.0.0.1:8025:8025" # Web UI
```

```sh title="/.env"
# mailer
MAILER_HOST=localhost
MAILER_PORT=1025
MAILER_SEND_ALL_MAILS_TO=demo-lead-dev@dextinity.com,demo-pm@dextinity.com
```

```ts title="/api/src/app.module.ts"
imports: [...MailerModule.register(config.mailer)];
```

```yaml title="/deployment/helm/values.tpl.yaml"
api:
  env:
    ...
    MAILER_HOST: "localhost"
    MAILER_PORT: 25
    MAILER_SEND_ALL_MAILS_TO: "demo-lead-dev@dextinity.com,demo-pm@dextinity.com"
```

## Usage

### Sending a Mail

Inject the `MailerService` into your service or controller: (MailerModule is global, so no module import is needed)

```typescript
@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class CustomProductResolver {
    constructor(
        private readonly mailerService: MailerService,
        ...,
    ) {}
    ...
}
```

send mail

```typescript
@Mutation(() => Boolean)
async publishAllProducts(): Promise<boolean> {
    ...
    await this.mailerService.sendMail({
        mailTypeForLogging: "products-published",
        to: "product-manager@dextinity.com",
        cc: "vice-product-manager@dextinity.com",
        subject: "All products have been published",
    });
    ...
}
```

### Config

The `MailerModule.register` config accepts two recipient-overriding options that are designed for different environments and do not combine:

#### `sendAllMailsTo`

Sends every mail to the given addresses instead of the original `to`. The original `cc` and `bcc` are dropped. Intended for non-prod environments to prevent mails from reaching real users.

```sh title="/.env"
MAILER_SEND_ALL_MAILS_TO=demo-lead-dev@dextinity.com,demo-pm@dextinity.com
```

#### `sendAllMailsBcc`

Adds the given addresses as an additional BCC to every mail. Intended as a production backup recipient. Not applied when `sendAllMailsTo` is set.

```sh title="/.env"
MAILER_SEND_ALL_MAILS_BCC=mail-archive@dextinity.com,mail-backup@dextinity.com
```

---

## Deleting Old Mail Logs

This is done automatically after creating a new mail log entry. For any custom cleanup you should use the MailLog Repository in your application.

---

## Mail Log Creation and Updates

Mail logs are created automatically whenever an email is sent using the `sendMail` method of the `MailerService`. Each log entry records details such as recipients, subject, mail options, additional data, and the mail type for filtering and statistics. The log is created before the email is sent.

After the email is sent, the log entry is updated with the result of the send operation (such as the message ID and status). If mail logging is disabled via configuration, no log entries are created or updated.

Mail logs can be disabled using the `logMail` option of `sendMail`.

---
