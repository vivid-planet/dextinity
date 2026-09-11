# Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md).  
By participating in this project, you agree to abide by its terms.

## Development

To run Dextinity locally, see [Getting started](README.md#getting-started) in our README.

## Versioning & branches

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Pull requests with minor or patch changes should target the [`main`](https://github.com/vivid-planet/dextinity/tree/main) branch, while major/breaking changes should target the [`next`](https://github.com/vivid-planet/dextinity/tree/next) branch.

## Pull requests

> [!WARNING]
> Please make sure to keep the pull request size at a minium!
> Smaller pull requests are easier to review and tend to get merged faster.
> Unrelated changes, refactorings, fixes etc. should be made in follow-up pull requests.

### Description

The description should describe the change you're making.
It will be used as the commit message for the squashed commit once the pull request gets merged.
Therefore, make sure to keep the description up-to-date as the pull request changes.

> [!WARNING]
> Please describe why you're making the change, not what you're changing.
> Reviewers see what you're changing when reviewing the code.
> However, they might not understand your motives as to why you're making the change.

Your description should include:

- The problem you're facing
- Your solution to the problem
- An example usage of your change

### Example

Make sure to provide an example of your change if your change includes a new API.
This can be either:

- A unit test (preferred)
- The implementation in Demo
- A development story in Storybook

### Screenshots/screencasts

When making a visual change, please provide either screenshots or screencasts.

### Changeset

Changes are documented using [changesets](https://github.com/changesets/changesets). Make sure to [add a changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) when making a notable change.

#### When to add a changeset

A changeset should be added when:

- changing the package's public API (`src/index.ts`), for instance, adding a new component
- fixing a bug
- making a visual change, for instance, changing a component's design

A changeset should not be added when:

- making a package internal change
- changing the dev setup or workflows

In general, you should add a changeset when you want your change to result in a new package version.

#### Changeset writing guidelines

Follow this guidelines when writing a changeset:

- Use active voice: "Add new thing" vs. "A new thing is added"
- The first line should be the title (without a period at the end): "Add new alert component"
- If necessary, provide additional information in the description
- Use backticks to highlight code: Add new `Alert` component
- Use bold formatting for "headlines" in the description: **Example**

Example for a good changeset:

````md
---
"@dextinity/site-nextjs": minor
---

Add `ErrorHandlerProvider`

Each block in `BlocksBlock`, `OneOfBlock` and `ListBlock` is wrapped with an error boundary to prevent the whole page from crashing when a single block throws an error.
In production, the broken block is hidden. The application should take care of reporting the error to an error tracking service (e.g., Sentry). In local development, the error is re-thrown.

Add an `ErrorHandler` to the root layout:

```tsx
// In src/app/layout.tsx
<html>
    <body className={inter.className}>
        {/* Other Providers */}
        <ErrorHandler>{children}</ErrorHandler>
    </body>
</html>
```

The `ErrorHandler` receives the errors in the application and can report them to the error tracking service.

**Example ErrorHandler**

```tsx
"use client";

import { ErrorHandlerProvider } from "@dextinity/site-nextjs";
import { PropsWithChildren } from "react";

export function ErrorHandler({ children }: PropsWithChildren) {
    function onError(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught by error handler", error, errorInfo.componentStack);
        if (process.env.NODE_ENV === "development") {
            throw error;
        } else {
            // Report the error to the error tracking service
        }
    }

    return <ErrorHandlerProvider onError={onError}>{children}</ErrorHandlerProvider>;
}
```
````

### Open TODOs/questions

Anything that needs to be done before merging the pull request, for instance, add a changeset.

### Further information

Further information that helps reviewing the pull request, for instance:

- Alternative solutions you have considered
- Related pull requests
- Links to relevant tasks, documentation, blog posts etc.

> [!WARNING]
> Make sure that everything required to understand your change is in the pull request description.
> Reviewers shouldn't need to review tasks, JIRA conversations etc. to understand what you're doing.
