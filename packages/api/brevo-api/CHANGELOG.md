# @comet/brevo-api

## 10.1.0

### Patch Changes

- @dextinity/cms-api@10.1.0

## 10.0.1

### Patch Changes

- @dextinity/cms-api@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/brevo-api` to `@dextinity/brevo-api`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { BrevoModule } from "@comet/brevo-api";
    + import { BrevoModule } from "@dextinity/brevo-api";
    ```

### Patch Changes

- Updated dependencies [86f90cb]
- Updated dependencies [f843a5e]
    - @dextinity/cms-api@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/brevo-api` to `@dextinity/brevo-api`

    Update the dependency in `package.json` and all imports:

    ```diff
    - import { BrevoModule } from "@comet/brevo-api";
    + import { BrevoModule } from "@dextinity/brevo-api";
    ```

### Patch Changes

- Updated dependencies [86f90cb]
- Updated dependencies [f843a5e]
- Updated dependencies [8c6be74]
    - @dextinity/cms-api@10.0.0-beta.0

## 9.5.0

### Patch Changes

- Updated dependencies [4eadaf5]
- Updated dependencies [4eadaf5]
    - @comet/cms-api@9.5.0

## 9.4.0

### Patch Changes

- Updated dependencies [0dac371]
- Updated dependencies [14d481e]
- Updated dependencies [8c6be74]
    - @comet/cms-api@9.4.0

## 9.3.0

### Patch Changes

- Updated dependencies [a8e8f02]
- Updated dependencies [924b66c]
    - @comet/cms-api@9.3.0

## 9.2.2

### Patch Changes

- Updated dependencies [d1022e2]
- Updated dependencies [a2515ce]
    - @comet/cms-api@9.2.2

## 9.2.1

### Patch Changes

- @comet/cms-api@9.2.1

## 9.2.0

### Patch Changes

- Updated dependencies [ee0bf93]
- Updated dependencies [3c28742]
- Updated dependencies [8d46a98]
    - @comet/cms-api@9.2.0

## 9.1.1

### Patch Changes

- @comet/cms-api@9.1.1

## 9.1.0

### Patch Changes

- Updated dependencies [319f5b8]
    - @comet/cms-api@9.1.0

## 9.0.1

### Patch Changes

- @comet/cms-api@9.0.1

## 9.0.0

### Major Changes

- 77a371e: Prevent importing dev dependencies in the API

    Add `import/no-extraneous-dependencies` rule with `devDependencies` restriction to the NestJS ESLint config, preventing accidental imports of dev-only packages in production source files. Dev dependencies may only be imported in test files.

    Fix `@comet/brevo-api` to correctly declare `@nestjs/graphql`, `graphql`, `graphql-scalars`, `lodash.isequal`, and `uuid` as dependencies/peerDependencies instead of devDependencies, since they are imported in source code.

- f932845: Update `@getbrevo/brevo` to v5

    The transactional mail service's `send` method now accepts a `SendTransacEmailRequest` (without `sender`) instead of a `SendSmtpEmail`. The commonly used fields (`to`, `subject`, `htmlContent`, `textContent`) are unchanged, so existing calls continue to work.

### Minor Changes

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- ba83625: Remove `node-fetch` dependency from `EcgRtrListService` in favor of Node's native `fetch`
- Updated dependencies [f1a473a]
- Updated dependencies [8954d64]
- Updated dependencies [4c1aeb2]
- Updated dependencies [67938b2]
- Updated dependencies [c0cee12]
- Updated dependencies [7fbe2a7]
- Updated dependencies [54f57dd]
- Updated dependencies [a50793a]
- Updated dependencies [cac2b3b]
- Updated dependencies [9d5f045]
- Updated dependencies [c6703db]
- Updated dependencies [8c2fdde]
- Updated dependencies [b0ceb9c]
- Updated dependencies [127a492]
- Updated dependencies [fa5c7a4]
- Updated dependencies [f6a2932]
- Updated dependencies [35e9e0d]
- Updated dependencies [91f4a9f]
- Updated dependencies [6b7adc7]
- Updated dependencies [31d9296]
- Updated dependencies [19a0528]
- Updated dependencies [71dce06]
- Updated dependencies [1b37655]
- Updated dependencies [f162fa5]
- Updated dependencies [1ad7de3]
- Updated dependencies [0e7d7e9]
- Updated dependencies [3f3da52]
- Updated dependencies [affbb11]
- Updated dependencies [fad0167]
- Updated dependencies [6793853]
- Updated dependencies [a2c2eb5]
- Updated dependencies [962a320]
- Updated dependencies [802b0b8]
- Updated dependencies [8bf0e5b]
- Updated dependencies [70a77db]
- Updated dependencies [2ea835c]
- Updated dependencies [8498a7c]
- Updated dependencies [ac59b62]
- Updated dependencies [171c335]
- Updated dependencies [8ad9dd8]
- Updated dependencies [bc57b4a]
- Updated dependencies [2fe9d4b]
- Updated dependencies [dd51208]
- Updated dependencies [8722deb]
    - @comet/cms-api@9.0.0

## 9.0.0-beta.6

### Major Changes

- f932845: Update `@getbrevo/brevo` to v5

    The transactional mail service's `send` method now accepts a `SendTransacEmailRequest` (without `sender`) instead of a `SendSmtpEmail`. The commonly used fields (`to`, `subject`, `htmlContent`, `textContent`) are unchanged, so existing calls continue to work.

### Patch Changes

- Updated dependencies [f1a473a]
- Updated dependencies [8954d64]
- Updated dependencies [4c1aeb2]
- Updated dependencies [67938b2]
- Updated dependencies [7fbe2a7]
- Updated dependencies [35e9e0d]
- Updated dependencies [91f4a9f]
- Updated dependencies [1b37655]
- Updated dependencies [affbb11]
- Updated dependencies [fad0167]
- Updated dependencies [6793853]
- Updated dependencies [70a77db]
- Updated dependencies [8498a7c]
- Updated dependencies [ac59b62]
    - @comet/cms-api@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [c0cee12]
- Updated dependencies [9d5f045]
- Updated dependencies [b0ceb9c]
- Updated dependencies [6b7adc7]
- Updated dependencies [a2c2eb5]
- Updated dependencies [8ad9dd8]
    - @comet/cms-api@9.0.0-beta.5

## 9.0.0-beta.4

### Patch Changes

- Updated dependencies [c6703db]
- Updated dependencies [127a492]
- Updated dependencies [fa5c7a4]
- Updated dependencies [31d9296]
- Updated dependencies [2fe9d4b]
    - @comet/cms-api@9.0.0-beta.4

## 9.0.0-beta.3

### Major Changes

- 77a371e: Prevent importing dev dependencies in the API

    Add `import/no-extraneous-dependencies` rule with `devDependencies` restriction to the NestJS ESLint config, preventing accidental imports of dev-only packages in production source files. Dev dependencies may only be imported in test files.

    Fix `@comet/brevo-api` to correctly declare `@nestjs/graphql`, `graphql`, `graphql-scalars`, `lodash.isequal`, and `uuid` as dependencies/peerDependencies instead of devDependencies, since they are imported in source code.

### Minor Changes

- dd51208: Update TypeScript compilation target to ES2023 and lib to ES2023 to match the required Node.js v22

### Patch Changes

- Updated dependencies [a50793a]
- Updated dependencies [cac2b3b]
- Updated dependencies [f6a2932]
- Updated dependencies [71dce06]
- Updated dependencies [0e7d7e9]
- Updated dependencies [962a320]
- Updated dependencies [802b0b8]
- Updated dependencies [8bf0e5b]
- Updated dependencies [2ea835c]
- Updated dependencies [dd51208]
- Updated dependencies [8722deb]
    - @comet/cms-api@9.0.0-beta.3

## 9.0.0-beta.2

### Patch Changes

- ba83625: Remove `node-fetch` dependency from `EcgRtrListService` in favor of Node's native `fetch`
- Updated dependencies [1ad7de3]
    - @comet/cms-api@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [19a0528]
- Updated dependencies [f162fa5]
- Updated dependencies [3f3da52]
- Updated dependencies [171c335]
    - @comet/cms-api@9.0.0-beta.1

## 9.0.0-beta.0

### Patch Changes

- @comet/cms-api@9.0.0-beta.0

## 8.20.0

### Patch Changes

- Updated dependencies [ed00704]
    - @comet/cms-api@8.20.0

## 8.19.0

### Patch Changes

- Updated dependencies [0eb28a7]
    - @comet/cms-api@8.19.0

## 8.18.0

### Patch Changes

- Updated dependencies [64b70bc]
- Updated dependencies [e9c54bc]
- Updated dependencies [ef98821]
- Updated dependencies [b3bfe86]
    - @comet/cms-api@8.18.0

## 8.17.1

### Patch Changes

- 91e9a8f: Update axios to 1.13.5 to fix CVE-2026-25639 (DoS via **proto** key in mergeConfig)
- Updated dependencies [91e9a8f]
    - @comet/cms-api@8.17.1

## 8.17.0

### Patch Changes

- @comet/cms-api@8.17.0

## 8.16.0

### Patch Changes

- @comet/cms-api@8.16.0

## 8.15.0

### Patch Changes

- 317ca97: Fix email campaigns getting stuck in broken state when scheduled in the past
    - Replace `@MinDate(new Date())` with `@MinDate(() => new Date())` to evaluate validation at runtime instead of class definition time
    - Check actual campaign status from Brevo before blocking updates to past-scheduled campaigns
    - Only block updates if campaign has actually been sent (not just scheduled in the past)
    - Automatically sync local campaign state with Brevo's actual state
    - @comet/cms-api@8.15.0

## 8.14.0

### Patch Changes

- Updated dependencies [736e4ae]
    - @comet/cms-api@8.14.0

## 8.13.0

### Patch Changes

- Updated dependencies [6b0b088]
- Updated dependencies [05638ed]
    - @comet/cms-api@8.13.0

## 8.12.0

### Minor Changes

- 297ceeb: Prefix all entities and API requests with `brevo` to prevent naming issues in projects.

    Update the entity name in the `additionalPageTreeNodeFieldsFragment` GraphQL fragment from `TargetGroup` to `BrevoTargetGroup` in the `targetGroupFormConfig`.

    ```
    export const additionalPageTreeNodeFieldsFragment = {
        fragment: gql`
            fragment TargetGroupFilters on BrevoTargetGroup {
                filters {
                    SALUTATION
                    BRANCH
                }
            }
       `,
        name: "TargetGroupFilters",
    };
    ```

- 297ceeb: Make this package compatible with [COMET v8](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v7-to-v8)

    Now requires
    - `@comet/cms-api` >= `8.0.0`
    - `@mikro-orm/*` >= `6.0.0`
    - `@nestjs/*` >= `11.0.0`
    - `reflect-metadata` >= `0.2.0`

### Patch Changes

- Updated dependencies [488da0b]
- Updated dependencies [2930556]
    - @comet/cms-api@8.12.0

## 3.1.4

### Patch Changes

- 9126afd: Resolve Issues with Brevo Config Page Permissions
    - Address a bug that required the brevo-newsletter-config permission to send email campaigns from the admin interface.
    - Improve error handling by enhancing the styling and incorporating a MUI Alert component to clearly display messages when the configuration is missing.

- cf4405c: Improve error handling for adding contacts:
    - Display specific error messages when attempting to create a contact that already exists or is blacklisted.
    - Provide error logs when importing blacklisted contacts via CSV import.

- 9c580ab: Remove brevo-newsletter-test-contacts permission. Creating test contacts is now allowed with the default permission brevo-newsletter.

## 3.1.3

### Patch Changes

- 228907b: Set the peer dependency to the major version of Comet, allowing the project to specify the desired minor version as needed.

## 3.1.2

## 3.1.1

### Patch Changes

- 1ba6c4d: Ensure contacts are properly assigned to target groups during CSV import process
- e7fdae6: Export `createBrevoEmailImportLogEntity` and `createBlacklistedContactsEntity` so these functions can be used without a `/lib` import

## 3.1.0

### Minor Changes

- 5ff4e5a: Add optional feature for importing contacts without sending a double opt-in email

    Enable creating contacts manually or using the import in admin without sending a double opt-in mail by setting a new environment variable:

    ```diff
    +   @IsBoolean()
    +   @IsUndefinable()
    +   @Transform(({ value }) => value === "true")
    +   ALLOW_ADDING_CONTACTS_WITHOUT_DOI?: boolean;
    ```

    Add `contactsWithoutDoi` to your`AppModule`:

    ```diff
             BrevoModule.register({
               brevo: {
                     //...
                   BlacklistedContacts
                  }
    +           contactsWithoutDoi: {
    +               allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
    +               emailHashKey: config.contactsWithoutDoi.emailHashKey,
                        },
               //...
             });
    ```

    Add `allowAddingContactsWithoutDoi` to the `config.ts` in the api:

    ```diff
        //...
        ecgRtrList: {
                apiKey: envVars.ECG_RTR_LIST_API_KEY,
            },
    +    contactsWithoutDoi: {
    +       allowAddingContactsWithoutDoi: envVars.ALLOW_ADDING_CONTACTS_WITHOUT_DOI,
            },
        //...
    ```

    Add it to the `config.ts` in the admin:

    ```diff
            //...
                return {
                        ...cometConfig,
                apiUrl: environmentVariables.API_URL,
                adminUrl: environmentVariables.ADMIN_URL,
                sitesConfig: JSON.parse(environmentVariables.SITES_CONFIG) as SitesConfig,
                buildDate: environmentVariables.BUILD_DATE,
                buildNumber: environmentVariables.BUILD_NUMBER,
                commitSha: environmentVariables.COMMIT_SHA,
                campaignUrl: environmentVariables.CAMPAIGN_URL,
    +           allowAddingContactsWithoutDoi: environmentVariables.ALLOW_ADDING_CONTACTS_WITHOUT_DOI === "true",
                      }
    ```

    Add `allowAddingContactsWithoutDoi` to the `BrevoConfigProvider` in your `App.tsx`:

    ```diff
        //...
               <BrevoConfigProvider
                     value={{
                            scopeParts: ["domain", "language"],
                            apiUrl: config.apiUrl,
                            resolvePreviewUrlForScope: (scope: ContentScope) => {
                                return `${config.campaignUrl}/block-preview/${scope.domain}/${scope.language}`;
                                },
    +                       allowAddingContactsWithoutDoi: config.allowAddingContactsWithoutDoi,
                                }}
                >
    ```

- c4041de: Add `BlacklistedContacts` table to store hashed blacklisted contacts to prevent importing blacklisted contacts

    If adding contacts without sending a double opt-in email is enabled, use `createBlacklistedContactsEntity` for creating a `BlacklistedContacts` entity. Pass `Scope` and add it to the `AppModule`:

    ```diff
              BrevoModule.register({
                brevo: {
                      //...
    +               BlacklistedContacts
                   }
                //...
              });
    ```

    Add `emailHashKey` to your environment variables:

    ```diff
    +  @IsString()
    +  @Length(64)
    +  EMAIL_HASH_KEY: string;
    ```

    Also add it to the `config.ts` and your `AppModule`:

    ```diff
        //...
        ecgRtrList: {
            apiKey: envVars.ECG_RTR_LIST_API_KEY,
        },
        contactsWithoutDoi: {
          allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
    +     emailHashKey: config.contactsWithoutDoi.emailHashKey,
        },
        sitePreviewSecret: envVars.SITE_PREVIEW_SECRET,
    ```

    ```diff
             BrevoModule.register({
               brevo: {
                     //...
                   BlacklistedContacts
                  }
                contactsWithoutDoi: {
                  allowAddingContactsWithoutDoi: config.contactsWithoutDoi.allowAddingContactsWithoutDoi,
    +             emailHashKey: config.contactsWithoutDoi.emailHashKey,
                        },
               //...
             });
    ```

- 45a5285: Added logging for contacts created without sending a double opt-in confirmation

    When a user adds a contact and skips sending the double opt-in email, the action is logged.

    If adding contacts without sending a double opt-in email is allowed, use `createBrevoEmailImportLogEntity` for creating `brevo-email-import-log` entity. Pass `Scope` and add it to the `AppModule`:

    ```diff
              BrevoModule.register({
                brevo: {
                      //...
    +           BrevoEmailImportLog
                       }
                    //...
                  });
    ```

### Patch Changes

- fc3bc63: Fix scope parameter handling in `doubleOptInTemplates` query

    Previously, the `scope` parameter in the `doubleOptInTemplates` query was not properly handled, causing it to always resolve to `undefined`. This update:
    - Adds proper scope parameter handling in the API
    - Implements scope parameter passing from the admin interface
    - Ensures correct template filtering based on scope

- a560a50: Fix an issue with scope handling that prevented saving test contacts and configuration settings
- f4e0c24: Fix CSV import by correcting types

    Previously, the type string[][] was used for the failedColumns field in the CSV import. While this worked in earlier versions, it caused an error after recent package updates. This issue has been resolved by changing the type to JSONObject, ensuring compatibility with the updated dependencies.

## 3.0.3

## 3.0.2

### Patch Changes

- c20792a: Remove `scope` from `BrevoConfig` database migration in module

    A custom database migration must be created in the project to add individual `scope` columns to `BrevoConfig`.

## 3.0.1

## 3.0.0

### Major Changes

- 0db9f4a: Make this package compatible with [COMET v7](https://docs.comet-dxp.com/docs/migration/migration-from-v6-to-v7)

    **Breaking Changes**:
    - Now requires >= v7.5.0 for `@comet` packages
    - Now requires >= 5.9.8 for `@mikro-orm` packages (except `@mikro-orm/nestjs` where >= 5.2.3 is required)

- 8ef6341: Refactor `email-campaign` and `target-group` entity

    Use `createEmailCampaignEntity` for creating `email-campaign` entity. Pass `EmailCampaignContentBlock`, `Scope` and `TargetGroup`.

    Use `createTargetGroupEntity` for creating `target-group` entity. Pass `Scope` and optional `BrevoFilterAttributes`

    Pass both to the `AppModule`:

    ````diff
          BrevoModule.register({
            brevo: {
                  //...
      +        EmailCampaign
      +        TargetGroup
               }
            //...
          });
      ```
    ````

- adb69fd: Refactor brevo contact import to upload files to public uploads temporarily

    The files for the brevo contact import now get temporarily stored in the public uploads until the import is concluded.
    This change prepares for future imports to be handled in a separate job, allowing more than 100 contacts to be imported without exhausting api resources or blocking the event loop.

    It is now necessary to import the `PublicUploadsModule` in the project's `AppModule` and configure it to accept csv files.

    ```ts
            PublicUploadModule.register({
                acceptedMimeTypes: ["text/csv"],
                maxFileSize: config.publicUploads.maxFileSize,
                directory: `${config.blob.storageDirectoryPrefix}-public-uploads`,
            }),
    ```

- d5319bc: Add `mail-rendering` package for providing reuseable components for rendering emails

    Add new `NewsletterImageBlock`

- cc4bd07: Add a brevo configuration field for `allowedRedirectionUrl`
  Env vars containing this information can be removed and must be removed from the brevo module configuration.

    ```diff
    BrevoModule.register({
        brevo: {
    -       allowedRedirectionUrl: config.brevo.allowedRedirectionUrl,
            //...
        },
        //..
    })
    ```

### Minor Changes

- e931996: Add field for `doubleOptInTemplateId` to `BrevoConfigPage`

    The environment variable BREVO_DOUBLE_OPT_IN_TEMPLATE_ID can be removed, as it is now available as a maintainable variable in the admin interface.

- 7215ec1: Add `folderId` to `BrevoConfig` to allow overwriting the default folderId `1`
- 4fb6b8f: A required brevo config page must now be generated with `createBrevoConfigPage`.
  All necessary brevo configuration (for each scope) must be configured within this page for emails campaigns to be sent.

    ```diff
    + const BrevoConfigPage = createBrevoConfigPage({
    +        scopeParts: ["domain", "language"],
    + });
    ```

    Env vars containing the brevo sender information can be removed.

    ```diff
    - BREVO_SENDER_NAME=senderName
    - BREVO_SENDER_EMAIL=senderEmail
    ```

- ea503b9: Add a brevo configuration field for `unsubscriptionPageId`

### Patch Changes

- a605a42: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.2.0

### Minor Changes

- f07d79a: Adds `createBrevoTestContactsPage` for creating a test contacts page, that is indepent from the main list.

    Remove `email` and `redirectionUrl` from `brevoContactsPageAttributesConfig`

- ada83cf: Add filter for `sendingState` in `EmailCampaignsGrid`
- dd93185: Add `BREVO_FOLDER_ID` to environment variables to allow overwriting default value `1`

## 2.1.6

### Patch Changes

- be6d19b: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.1.5

### Patch Changes

- 54b8858: Add `@nestjs/core` as a peer dependency. It should have been included as a peer dependency from the beginning.

## 2.1.4

### Patch Changes

- cc296b4: Remove peerDependency for axios. Axios is not needed anymore.

## 2.1.3

### Patch Changes

- 3c5b342: Fix brevo error handling error

    Fix brevo error handling causing contact import to fail if contact does not exists in brevo yet

## 2.1.2

### Patch Changes

- e6dc804: Handle brevo errors explicitly to improve error messages
- f675cd0: CSV Import Validation Improvements and Bug Fix

    Add better validation for csv imports.

    Add better feedback after a csv import when something goes wrong. User can download a file with failing rows.

    Fix a bug when importing via csv in a targetgroup. The contact was only added to the manually assigned contacts and not to the actual target group.

- acffd63: Support multiselect values in contact import

    Previously the contact import did not support multiselect values since brevo expects an array of values and the csv import only sent values as strings. Now the import value gets transformed to an array in case the contact attribute should be of type array. The value in the csv file's column needs to be separated with a comma in case of multiple selected values.

## 2.1.1

### Patch Changes

- 06d4132: Add check for arrays in `checkIfContactIsInTargetGroup` function, to check if at least one `contactAttribute` is included in the filter.

## 2.1.0

### Minor Changes

- 3606421: Brevo returns a 404 error when an email address is not found and a 400 error if an invalid email is provided. Instead of handling only one of these errors, both status codes must be ignored to prevent the contact search from throwing an error.

## 2.0.2

### Patch Changes

- 06c18b7: Fix campaign statistics

    Addressed an issue where the globalStats property was being used to retrieve campaign stats, but it wasn’t working as expected. We now use the campaignStats property instead, which returns a list. The first value from this list is now used to show accurate campaign statistics.

- b1cff9b: Fix searching contacts

    Previously, Brevo returned a 400 error when an email address was not found. The implementation has been updated to correctly handle the 404 status code instead of 400. As a result, the contact search functionality now works as expected without throwing an error when no matching email address is found.

## 2.0.1

### Patch Changes

- 799366c: Prevent invisible blocks from being included in the newsletter

## 2.0.0

### Major Changes

- 7461c8b: Basic migrations for EmailCampaign and TargetGroup are now available in the module directly.

    They must be imported into the project and added to the `migrationsList` in the `ormConfig`. Migrations for adding the `scope` and `filters` must still be done in the project's migrations.

    ```diff
    export const ormConfig = createOrmConfig({
        // ...
        migrations: {
            // ...
    -       migrationsList: createMigrationsList(path.resolve(__dirname, "migrations")),
    +       migrationsList: [...brevoMigrationsList, ...createMigrationsList(path.resolve(__dirname, "migrations"))],
        },
    });

    ```

    **Breaking Changes**:
    - Requires adaption of the project's migrations

- 6b5b9a4: The `allowedRedirectUrl` must now be configured within the resolveConfig for each specific scope, instead of being set once for all scopes in the brevo config.

    ```diff
       BrevoModule.register({
                        brevo: {
                            resolveConfig: (scope: EmailCampaignContentScope) => {
                                // change config based on scope - for example different sender email
                                // this is just to show you can use the scope to change the config but it has no real use in this example
                                if (scope.domain === "main") {
                                    return {
                                        apiKey: config.brevo.apiKey,
                                        doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                        sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                                   allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    };
                                } else {
                                    return {
                                        apiKey: config.brevo.apiKey,
                                        doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
                                        sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                                   allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                                    };
                                }
                            },
                            BrevoContactAttributes,
                            BrevoContactFilterAttributes,
    -                       allowedRedirectUrl: config.brevo.allowedRedirectUrl,
                        },
        })
    ```

- 166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:
    - Now requires >= v6.0.0 for `@comet` packages
    - All GraphQL resolvers now require the `brevo-newsletter` permission.
    - `BrevoContactResolver#subscribeBrevoContact` mutation: The `scope` argument was moved outside `input` to enable an automatic scope check
    - `BrevoContactsService#createDoubleOptInContact`: `scope` was moved outside `data` and is now the second argument
    - `TargetGroupsService#findNonMainTargetGroups`: `data` was replaced with `scope`

- aae0de4: Add `redirectUrlForImport` to `BrevoModule` config

    You must now pass a `redirectUrlForImport` to your `BrevoModule` config:

    ```ts
    BrevoModule.register({
        brevo: {
            resolveConfig: (scope: EmailCampaignContentScope) => {
                return {
                    // ...
                    redirectUrlForImport: config.brevo.redirectUrlForImport,
                };
            },
        },
    });
    ```

    The `redirectUrlForImport` will usually be the site URL of a scope. It is used by the CSV contact import as redirect target after the user completes the double opt-in.

- b254b38: Removes the brevo config page, `createBrevoConfigPage` is no longer available.

    ```diff
    -    const BrevoConfigPage = createBrevoConfigPage({
    -        scopeParts: ["domain", "language"],
    -    });
    ```

    Brevo config now must be set in the api brevo module initialization and can be adjusted depending on the scope.
    Scope argument was added to resolver and service functions to ensure the correct config is used for passed scope.

    ```diff
        BrevoModule.register({
            brevo: {
    +           resolveConfig: (scope: EmailCampaignContentScope) => {
    +               if (scope.domain === "main") {
    +                   return {
    +                       apiKey: config.brevo.apiKey,
    +                       doubleOptInTemplateId: config.brevo.doubleOptInTemplateId,
    +                       sender: { name: config.brevo.sender.name, email: config.brevo.sender.email },
    +                   };
    +               } else {
    +                   return {
    +                       apiKey: config.brevo.otherApiKey,
    +                       doubleOptInTemplateId: config.brevo.otherDoubleOptInTemplateId,
    +                       sender: { name: config.brevo.otherSender.name, email: config.brevo.otherSender.email },
    +                   };
    +               }
    +           },
                // ...
            },
        })
    ```

### Minor Changes

- d21db92: Add `DeleteUnsubscribedBrevoContactsConsole` job to enable the deletion of blocklisted contacts. This job can be utilized as a cronjob to periodically clean up the blocklisted contacts.
- 31f1241: Export `BrevoContactsService` so that it can be used in the application

    This allows, for example, adding a custom REST request in the application to subscribe to the newsletter. The application should then add reCAPTCHA before calling the BrevoContactsService to prevent problems with bots.

- e774ecb: Allow manually assigning contacts to a target group

    This is in addition to the existing automatic assignment via filters.

- 34beaac: All assigned contacts are now displayed in a datagrid on the target group edit admin page.
- 6cf6252: Add scope to the preview state so it can be accessed in the preview page if necessary
- aae0de4: Add functionality to import Brevo contacts from CSV files

    You can import CSV files via the Admin interface or via CLI command.

    **Note:** For the import to work, you must provide a `redirectUrlForImport` to the `BrevoModule` in the API and an `apiUrl` to the `BrevoConfigProvider` in the admin. See the respective changelog entries for more information.

    CLI command:

    ```bash
    npm run --prefix api console import-brevo-contacts -- -p <path-to-csv-file> -s '<scope-json>' [--targetGroupIds <ids...>]

    // Example:
    npm run --prefix api console import-brevo-contacts -- -p test_contacts_import.csv -s '{"domain": "main", "language":"de"}' --targetGroupIds 2618c982-fdf8-4cab-9811-a21d3272c62c,c5197539-2529-48a7-9bd1-764e9620cbd2
    ```

- 3f3fdeb: Add and export `BrevoTransactionalMailsService` that can be used in the application for sending transactional mails.

    **Example Usage of `BrevoTransactionalMailsService`**

    ```typescript
    constructor(private readonly brevoTransactionalMailsService: BrevoTransactionalMailsService) {}

    async send(email: string, htmlContent: string, subject: string): Promise<void> {
        await this.brevoTransactionalMailsService.send({ to: [{ email }], htmlContent, subject }, data.scope);
    }
    ```

- f7c0fdd: Allow sending a campaign to multiple target groups
- 42746b1: Add an edit page for brevo contacts
  It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

    ```diff
        createBrevoContactsPage({
             //...
    +        additionalFormFields: brevoContactConfig.additionalFormFields,
    +        input2State: brevoContactConfig.input2State,
        });
    ```

- 3407537: Add `id` to the POST request to the mailing frontend, enabling applications to use the `id` to generate a `browserUrl` for rendering the email in a web browser.
- 44fcc6c: A required brevo config page must now be generated with `createBrevoConfigPage`.
  All necessary brevo configuration (for each scope) must be configured within this page for emails campaigns to be sent.

    ```diff
    + const BrevoConfigPage = createBrevoConfigPage({
    +        scopeParts: ["domain", "language"],
    + });
    ```

    Env vars containing the brevo sender information can be removed.

    ```diff
    - BREVO_SENDER_NAME=senderName
    - BREVO_SENDER_EMAIL=senderEmail
    ```

### Patch Changes

- 42746b1: Fix bug that does not add the contact to all target groups when subscribing
