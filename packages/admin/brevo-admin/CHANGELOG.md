# @comet/brevo-admin

## 10.1.0

### Patch Changes

- @dextinity/admin@10.1.0
- @dextinity/admin-date-time@10.1.0
- @dextinity/admin-icons@10.1.0
- @dextinity/cms-admin@10.1.0

## 10.0.1

### Patch Changes

- Updated dependencies [48748b0]
    - @dextinity/admin@10.0.1
    - @dextinity/admin-date-time@10.0.1
    - @dextinity/cms-admin@10.0.1
    - @dextinity/admin-icons@10.0.1

## 10.0.0

### Major Changes

- f843a5e: Rename `@comet/brevo-admin` to `@dextinity/brevo-admin`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Resolve the configuration via `DextinityConfigProvider` instead of `CometConfigProvider`

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
    - @dextinity/admin-date-time@10.0.0
    - @dextinity/admin-icons@10.0.0
    - @dextinity/admin@10.0.0
    - @dextinity/cms-admin@10.0.0

## 10.0.0-beta.0

### Major Changes

- f843a5e: Rename `@comet/brevo-admin` to `@dextinity/brevo-admin`

    Update the dependency in `package.json` and all imports.

    **Breaking changes**
    - Resolve the configuration via `DextinityConfigProvider` instead of `CometConfigProvider`

### Patch Changes

- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [f843a5e]
- Updated dependencies [085b9ac]
- Updated dependencies [0f17fbd]
    - @dextinity/admin-date-time@10.0.0-beta.0
    - @dextinity/admin-icons@10.0.0-beta.0
    - @dextinity/admin@10.0.0-beta.0
    - @dextinity/cms-admin@10.0.0-beta.0

## 9.5.0

### Patch Changes

- @comet/admin@9.5.0
- @comet/admin-date-time@9.5.0
- @comet/admin-icons@9.5.0
- @comet/cms-admin@9.5.0

## 9.4.0

### Patch Changes

- Updated dependencies [bf1ff64]
- Updated dependencies [ca88ec6]
- Updated dependencies [ca88ec6]
- Updated dependencies [4e27111]
- Updated dependencies [71d6a95]
- Updated dependencies [085b9ac]
- Updated dependencies [0f17fbd]
    - @comet/admin@9.4.0
    - @comet/cms-admin@9.4.0
    - @comet/admin-date-time@9.4.0
    - @comet/admin-icons@9.4.0

## 9.3.0

### Patch Changes

- Updated dependencies [7b2d8db]
- Updated dependencies [924b66c]
    - @comet/admin@9.3.0
    - @comet/cms-admin@9.3.0
    - @comet/admin-date-time@9.3.0
    - @comet/admin-icons@9.3.0

## 9.2.2

### Patch Changes

- @comet/admin@9.2.2
- @comet/admin-date-time@9.2.2
- @comet/admin-icons@9.2.2
- @comet/cms-admin@9.2.2

## 9.2.1

### Patch Changes

- @comet/admin@9.2.1
- @comet/admin-date-time@9.2.1
- @comet/admin-icons@9.2.1
- @comet/cms-admin@9.2.1

## 9.2.0

### Patch Changes

- Updated dependencies [ee0bf93]
- Updated dependencies [5a05d97]
- Updated dependencies [8c866a3]
- Updated dependencies [48d06d6]
- Updated dependencies [ba56f97]
- Updated dependencies [eb0b156]
    - @comet/cms-admin@9.2.0
    - @comet/admin@9.2.0
    - @comet/admin-date-time@9.2.0
    - @comet/admin-icons@9.2.0

## 9.1.1

### Patch Changes

- Updated dependencies [097f85a]
    - @comet/cms-admin@9.1.1
    - @comet/admin@9.1.1
    - @comet/admin-date-time@9.1.1
    - @comet/admin-icons@9.1.1

## 9.1.0

### Patch Changes

- 5628cb4: Fix typo in the contact import error message ("occured" → "occurred")
- Updated dependencies [319f5b8]
    - @comet/cms-admin@9.1.0
    - @comet/admin@9.1.0
    - @comet/admin-date-time@9.1.0
    - @comet/admin-icons@9.1.0

## 9.0.1

### Patch Changes

- Updated dependencies [0c8063e]
    - @comet/cms-admin@9.0.1
    - @comet/admin@9.0.1
    - @comet/admin-date-time@9.0.1
    - @comet/admin-icons@9.0.1

## 9.0.0

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 9cb3f95: Bump MUI X Date Pickers peer dependency to v8

    See the migration guide for information on how to upgrade.

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- 51f25f1: Fix `BrevoContactForm` sending `sendDoubleOptIn` in update mutation

    `sendDoubleOptIn` is not a valid field of `BrevoContactUpdateInput` and only applies when creating a contact. The field was being included in the update payload because it was initialized in form state but not stripped out before the update mutation was called.

- Updated dependencies [4c1aeb2]
- Updated dependencies [92281f1]
- Updated dependencies [dc8f29c]
- Updated dependencies [15e771b]
- Updated dependencies [c0cee12]
- Updated dependencies [d7b77af]
- Updated dependencies [7fbe2a7]
- Updated dependencies [d7b77af]
- Updated dependencies [1475f4a]
- Updated dependencies [3fda20b]
- Updated dependencies [3cbf0ff]
- Updated dependencies [8a93124]
- Updated dependencies [1a83c01]
- Updated dependencies [15e771b]
- Updated dependencies [8c2fdde]
- Updated dependencies [f066335]
- Updated dependencies [ee24125]
- Updated dependencies [b4ba869]
- Updated dependencies [0e9189b]
- Updated dependencies [c6703db]
- Updated dependencies [8cb0844]
- Updated dependencies [127a492]
- Updated dependencies [c6703db]
- Updated dependencies [fa5c7a4]
- Updated dependencies [5d006c1]
- Updated dependencies [31d9296]
- Updated dependencies [57678d0]
- Updated dependencies [fdabaf1]
- Updated dependencies [c7f80e9]
- Updated dependencies [8e40458]
- Updated dependencies [ae85ba9]
- Updated dependencies [25f7342]
- Updated dependencies [71dce06]
- Updated dependencies [5f1566a]
- Updated dependencies [99140f8]
- Updated dependencies [b459ec7]
- Updated dependencies [cabba53]
- Updated dependencies [790e8d0]
- Updated dependencies [8e3a074]
- Updated dependencies [3fda20b]
- Updated dependencies [f29b2d7]
- Updated dependencies [fd5c36f]
- Updated dependencies [3c81ff0]
- Updated dependencies [5e87236]
- Updated dependencies [631540c]
- Updated dependencies [7ab96c2]
- Updated dependencies [85b09a2]
- Updated dependencies [171c335]
- Updated dependencies [4729b3f]
- Updated dependencies [8ad9dd8]
- Updated dependencies [bc57b4a]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [9cb3f95]
- Updated dependencies [ab5e547]
    - @comet/cms-admin@9.0.0
    - @comet/admin@9.0.0
    - @comet/admin-date-time@9.0.0
    - @comet/admin-icons@9.0.0

## 9.0.0-beta.6

### Patch Changes

- 51f25f1: Fix `BrevoContactForm` sending `sendDoubleOptIn` in update mutation

    `sendDoubleOptIn` is not a valid field of `BrevoContactUpdateInput` and only applies when creating a contact. The field was being included in the update payload because it was initialized in form state but not stripped out before the update mutation was called.

- Updated dependencies [4c1aeb2]
- Updated dependencies [15e771b]
- Updated dependencies [7fbe2a7]
- Updated dependencies [1a83c01]
- Updated dependencies [15e771b]
- Updated dependencies [b4ba869]
- Updated dependencies [0e9189b]
- Updated dependencies [57678d0]
- Updated dependencies [c7f80e9]
- Updated dependencies [b459ec7]
- Updated dependencies [5e87236]
- Updated dependencies [7ab96c2]
    - @comet/cms-admin@9.0.0-beta.6
    - @comet/admin@9.0.0-beta.6
    - @comet/admin-date-time@9.0.0-beta.6
    - @comet/admin-icons@9.0.0-beta.6

## 9.0.0-beta.5

### Patch Changes

- Updated dependencies [c0cee12]
- Updated dependencies [3cbf0ff]
- Updated dependencies [8cb0844]
- Updated dependencies [5d006c1]
- Updated dependencies [fdabaf1]
- Updated dependencies [8ad9dd8]
    - @comet/cms-admin@9.0.0-beta.5
    - @comet/admin@9.0.0-beta.5
    - @comet/admin-date-time@9.0.0-beta.5
    - @comet/admin-icons@9.0.0-beta.5

## 9.0.0-beta.4

### Patch Changes

- Updated dependencies [d7b77af]
- Updated dependencies [d7b77af]
- Updated dependencies [c6703db]
- Updated dependencies [127a492]
- Updated dependencies [c6703db]
- Updated dependencies [fa5c7a4]
- Updated dependencies [31d9296]
- Updated dependencies [8e40458]
- Updated dependencies [ae85ba9]
- Updated dependencies [2fe9d4b]
- Updated dependencies [460cbfb]
- Updated dependencies [ab5e547]
    - @comet/admin@9.0.0-beta.4
    - @comet/cms-admin@9.0.0-beta.4
    - @comet/admin-date-time@9.0.0-beta.4
    - @comet/admin-icons@9.0.0-beta.4

## 9.0.0-beta.3

### Patch Changes

- Updated dependencies [dc8f29c]
- Updated dependencies [1475f4a]
- Updated dependencies [8a93124]
- Updated dependencies [71dce06]
- Updated dependencies [cabba53]
- Updated dependencies [f29b2d7]
- Updated dependencies [3c81ff0]
- Updated dependencies [4729b3f]
    - @comet/cms-admin@9.0.0-beta.3
    - @comet/admin@9.0.0-beta.3
    - @comet/admin-date-time@9.0.0-beta.3
    - @comet/admin-icons@9.0.0-beta.3

## 9.0.0-beta.2

### Major Changes

- 99140f8: Bump MUI X Data Grid peer dependency to v8

    See the migration guide for information on how to upgrade.

- 9cb3f95: Bump MUI X Date Pickers peer dependency to v8

    See the migration guide for information on how to upgrade.

### Patch Changes

- 92281f1: Add `"sideEffects"` to package.json for better tree-shakability
- Updated dependencies [92281f1]
- Updated dependencies [25f7342]
- Updated dependencies [99140f8]
- Updated dependencies [9cb3f95]
    - @comet/admin@9.0.0-beta.2
    - @comet/admin-date-time@9.0.0-beta.2
    - @comet/admin-icons@9.0.0-beta.2
    - @comet/cms-admin@9.0.0-beta.2

## 9.0.0-beta.1

### Patch Changes

- Updated dependencies [8c2fdde]
- Updated dependencies [8e3a074]
- Updated dependencies [85b09a2]
- Updated dependencies [171c335]
    - @comet/cms-admin@9.0.0-beta.1
    - @comet/admin@9.0.0-beta.1
    - @comet/admin-date-time@9.0.0-beta.1
    - @comet/admin-icons@9.0.0-beta.1

## 9.0.0-beta.0

### Minor Changes

- f066335: Add support for React 19

### Patch Changes

- Updated dependencies [3fda20b]
- Updated dependencies [f066335]
- Updated dependencies [ee24125]
- Updated dependencies [5f1566a]
- Updated dependencies [790e8d0]
- Updated dependencies [3fda20b]
- Updated dependencies [fd5c36f]
- Updated dependencies [631540c]
    - @comet/admin-date-time@9.0.0-beta.0
    - @comet/admin-icons@9.0.0-beta.0
    - @comet/admin@9.0.0-beta.0
    - @comet/cms-admin@9.0.0-beta.0

## 8.20.0

### Patch Changes

- Updated dependencies [ed00704]
- Updated dependencies [412ed19]
- Updated dependencies [caceff8]
    - @comet/cms-admin@8.20.0
    - @comet/admin@8.20.0
    - @comet/admin-icons@8.20.0
    - @comet/admin-date-time@8.20.0

## 8.19.0

### Patch Changes

- Updated dependencies [fff2cc2]
- Updated dependencies [fff2cc2]
    - @comet/admin@8.19.0
    - @comet/cms-admin@8.19.0
    - @comet/admin-date-time@8.19.0
    - @comet/admin-icons@8.19.0

## 8.18.0

### Patch Changes

- Updated dependencies [64b70bc]
- Updated dependencies [ed029fb]
- Updated dependencies [0ce431c]
- Updated dependencies [d344f53]
    - @comet/cms-admin@8.18.0
    - @comet/admin@8.18.0
    - @comet/admin-date-time@8.18.0
    - @comet/admin-icons@8.18.0

## 8.17.1

### Patch Changes

- Updated dependencies [91e9a8f]
    - @comet/admin-icons@8.17.1
    - @comet/admin@8.17.1
    - @comet/admin-date-time@8.17.1
    - @comet/cms-admin@8.17.1

## 8.17.0

### Patch Changes

- Updated dependencies [45163f1]
    - @comet/admin@8.17.0
    - @comet/admin-date-time@8.17.0
    - @comet/cms-admin@8.17.0
    - @comet/admin-icons@8.17.0

## 8.16.0

### Patch Changes

- Updated dependencies [472b496]
    - @comet/admin@8.16.0
    - @comet/admin-date-time@8.16.0
    - @comet/cms-admin@8.16.0
    - @comet/admin-icons@8.16.0

## 8.15.0

### Patch Changes

- Updated dependencies [cc96333]
- Updated dependencies [180d1e3]
- Updated dependencies [f7b9de9]
- Updated dependencies [39a9bb0]
- Updated dependencies [5b52998]
- Updated dependencies [2bbb9c1]
- Updated dependencies [0c2435a]
- Updated dependencies [9333e9c]
    - @comet/admin@8.15.0
    - @comet/cms-admin@8.15.0
    - @comet/admin-date-time@8.15.0
    - @comet/admin-icons@8.15.0

## 8.14.0

### Patch Changes

- Updated dependencies [f31b52e]
- Updated dependencies [5075f7a]
- Updated dependencies [d0a7c96]
    - @comet/admin@8.14.0
    - @comet/cms-admin@8.14.0
    - @comet/admin-date-time@8.14.0
    - @comet/admin-icons@8.14.0

## 8.13.0

### Patch Changes

- Updated dependencies [60ecc0a]
- Updated dependencies [6b0b088]
- Updated dependencies [dbf8774]
- Updated dependencies [5cfa88d]
    - @comet/cms-admin@8.13.0
    - @comet/admin@8.13.0
    - @comet/admin-date-time@8.13.0
    - @comet/admin-icons@8.13.0

## 8.12.0

### Minor Changes

- 297ceeb: Make this package compatible with [COMET v8](https://docs.comet-dxp.com/docs/migration-guide/migration-from-v7-to-v8)

    Now requires
    - `@comet/*` >= `8.0.0`
    - `@mui/*` >= `7.0.0`

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

### Patch Changes

- Updated dependencies [12466e4]
- Updated dependencies [02c25c1]
    - @comet/admin@8.12.0
    - @comet/cms-admin@8.12.0
    - @comet/admin-date-time@8.12.0
    - @comet/admin-icons@8.12.0

## 3.1.4

### Patch Changes

- 9126afd: Resolve Issues with Brevo Config Page Permissions
    - Address a bug that required the brevo-newsletter-config permission to send email campaigns from the admin interface.
    - Improve error handling by enhancing the styling and incorporating a MUI Alert component to clearly display messages when the configuration is missing.

- cf4405c: Improve error handling for adding contacts:
    - Display specific error messages when attempting to create a contact that already exists or is blacklisted.
    - Provide error logs when importing blacklisted contacts via CSV import.

## 3.1.3

### Patch Changes

- 228907b: Set the peer dependency to the major version of Comet, allowing the project to specify the desired minor version as needed.

## 3.1.2

### Patch Changes

- 7aadab3: Fix block preview being too small on view page of already sent campaings

## 3.1.1

### Patch Changes

- 1ba6c4d: Ensure contacts are properly assigned to target groups during CSV import process

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

## 3.0.3

### Patch Changes

- 1b9cf61: Deprecate `scopeParts` in `createBrevoTestContactsPage` and use scopeParts from the BrevoConfig instead

    Instead, the `scopeParts` from the BrevoConfig will be used. This is in line with the other Page factories.

## 3.0.2

## 3.0.1

### Patch Changes

- c15195c: Improve send manager UX by positioning the TargetGroup field at the top and adding an info icon to all other fields, indicating that the TargetGroup must be selected and saved first.
- 5059c86: Fix scope in brevoTestContactsSelectQuery

## 3.0.0

### Major Changes

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

- aa75e4c: Define `scopeParts` in `BrevoConfig`

    Previously the `scopeParts` were passed to the functions:
    - createBrevoContactsPage
    - createTargetGroupsPage
    - createEmailCampaignsPage
    - createBrevoConfigPage

    Now they are defined once in the `BrevoConfig`:

    ```tsx
    <BrevoConfigProvider
        value={{
            scopeParts: ["domain", "language"],
            ...otherProps,
        }}
    >
        {children}
    </BrevoConfigProvider>
    ```

### Minor Changes

- e931996: Add field for `doubleOptInTemplateId` to `BrevoConfigPage`

    The environment variable BREVO_DOUBLE_OPT_IN_TEMPLATE_ID can be removed, as it is now available as a maintainable variable in the admin interface.

- 7215ec1: Add `folderId` to `BrevoConfig` to allow overwriting the default folderId `1`
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

- ea503b9: Add a brevo configuration field for `unsubscriptionPageId`

### Patch Changes

- a605a42: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.2.0

### Minor Changes

- f07d79a: Adds `createBrevoTestContactsPage` for creating a test contacts page, that is indepent from the main list.

    Remove `email` and `redirectionUrl` from `brevoContactsPageAttributesConfig`

- d32e9e8: Replace the `TextField` with a `FinalFormSelect` component in the `TestEmailCampaignForm`, allowing users to choose contacts directly from the `TestContactList`
- ada83cf: Add filter for `sendingState` in `EmailCampaignsGrid`

## 2.1.6

### Patch Changes

- be6d19b: Remove the `totalContactsBlocked` field from the `TargetGroup` type, because it is not delivered in the list request in Brevo anymore.

## 2.1.5

## 2.1.4

## 2.1.3

## 2.1.2

### Patch Changes

- f675cd0: CSV Import Validation Improvements and Bug Fix

    Add better validation for csv imports.

    Add better feedback after a csv import when something goes wrong. User can download a file with failing rows.

    Fix a bug when importing via csv in a targetgroup. The contact was only added to the manually assigned contacts and not to the actual target group.

## 2.1.1

## 2.1.0

## 2.0.2

## 2.0.1

## 2.0.0

### Major Changes

- e5dbbfa: Add `resolvePreviewUrlForScope` in `BrevoConfigProvider` to be able to provide internationalization for the preview. The previous `previewUrl` option has been removed and must be defined via the `resolvePreviewUrlForScope`.

    **The project can then call different urls based on the scope like that:**

    ```typescript
        resolvePreviewUrlForScope: (scope: ContentScope) => {
            return `${config.campaignUrl}/preview/${scope.domain}/${scope.language}`;
        },
    ```

- 166ac36: Make this package compatible with [COMET v6](https://docs.comet-dxp.com/docs/migration/migration-from-v5-to-v6)

    **Breaking Changes**:
    - Now requires >= v6.0.0 for `@comet` packages

- aae0de4: Add `BrevoConfigProvider`

    You must add the new `BrevoConfigProvider` in you `App.tsx`. The config requires passing the `apiUrl`:

    ```tsx
    <BrevoConfigProvider value={{ apiUrl: config.apiUrl }}>{/* ... */}</BrevoConfigProvider>
    ```

    The `apiUrl` is used by the CSV contact import to upload files to the API.

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

### Minor Changes

- e774ecb: Allow manually assigning contacts to a target group

    This is in addition to the existing automatic assignment via filters.

- 34beaac: All assigned contacts are now displayed in a datagrid on the target group edit admin page.
- 274cc77: Add a download button in the target group grid to download a list of contacts as csv file.

    It is possible to configure additional contact attributes for the export in the `createTargetGroupsPage`.

    ```diff
    createTargetGroupsPage({
        // ....
    +   exportTargetGroupOptions: {
    +       additionalAttributesFragment: brevoContactConfig.additionalAttributesFragment,
    +       exportFields: brevoContactConfig.exportFields,
    +   },
    });
    ```

- a7b82e7: Add `scope` in `previewState` for the `EmailCampaignView`

    This can be useful for example when applications have different styling depending on the scope.

- be70f36: Fix `TargetGroupForms` if no additional form fields are defined.
- aae0de4: Add functionality to import Brevo contacts from CSV files

    You can import CSV files via the Admin interface or via CLI command.

    **Note:** For the import to work, you must provide a `redirectUrlForImport` to the `BrevoModule` in the API and an `apiUrl` to the `BrevoConfigProvider` in the admin. See the respective changelog entries for more information.

    CLI command:

    ```bash
    npm run --prefix api console import-brevo-contacts -- -p <path-to-csv-file> -s '<scope-json>' [--targetGroupIds <ids...>]

    // Example:
    npm run --prefix api console import-brevo-contacts -- -p test_contacts_import.csv -s '{"domain": "main", "language":"de"}' --targetGroupIds 2618c982-fdf8-4cab-9811-a21d3272c62c,c5197539-2529-48a7-9bd1-764e9620cbd2
    ```

- f7c0fdd: Allow sending a campaign to multiple target groups
- 539b321: Allow react-intl v5 and v6 as peerDependency
- 42746b1: Add an edit page for brevo contacts
  It is possible to configure additional form fields for this page in the `createBrevoContactsPage`.

    ```diff
        createBrevoContactsPage({
             //...
    +        additionalFormFields: brevoContactConfig.additionalFormFields,
    +        input2State: brevoContactConfig.input2State,
        });
    ```

### Patch Changes

- 5b763f3: Fix scheduledAt date validation error shown when scheduleAt date is in the past when email campaign is already sending or in sent state
  Now routing back to the email campaign grid after sending email campaign now
