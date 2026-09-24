---
title: Implementing reCAPTCHA for a form
---

This guide explains how to add [Google reCAPTCHA Enterprise](https://cloud.google.com/recaptcha) to a form in a Dextinity site.
reCAPTCHA protects your forms from spam and abuse by assessing risk on the server side without requiring user interaction.

## Prerequisites

- A reCAPTCHA Enterprise **site key**
- A Google Cloud **service account key** with the `reCAPTCHA Enterprise Agent` role

## Install dependencies

```bash
npm install @google-cloud/recaptcha-enterprise
npm install --save-dev @types/grecaptcha
```

Add `@types/grecaptcha` to `knip.json` under `ignoreDependencies` for your site workspace since it is a type-only package. The site usually lives in `site/`, but may be located in another folder (e.g., `frontend/`); use whichever path matches your project:

```json title="knip.json"
"site": {
    "ignoreDependencies": ["@babel/core", "@types/grecaptcha"]
}
```

## Set up environment variables

Add the following variables to your `.env` file:

```bash
RECAPTCHA_SITE_KEY=        # Your reCAPTCHA Enterprise site key
RECAPTCHA_SERVICE_ACCOUNT= # Base64-encoded service account JSON
```

The service account JSON must be base64-encoded:

```bash
base64 -i service-account.json
```

Pass `RECAPTCHA_SITE_KEY` through the site config so it is available at runtime (see [Pass the site key through site config](#pass-the-site-key-through-site-config)).

## Create server-side utilities

### reCAPTCHA client

Create a shared server-side client that is initialised once from the service account credentials:

```ts title="src/util/recaptcha/recaptchaClient.ts"
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

if (process.env.RECAPTCHA_SERVICE_ACCOUNT === undefined) {
    throw new Error("Missing RECAPTCHA_SERVICE_ACCOUNT environment variable");
}

const serviceAccountObject = JSON.parse(
    Buffer.from(process.env.RECAPTCHA_SERVICE_ACCOUNT, "base64").toString("utf8"),
);

export const recaptchaClient = new RecaptchaEnterpriseServiceClient({
    credentials: serviceAccountObject,
});

export const recaptchaResourceName = recaptchaClient.projectPath(serviceAccountObject.project_id);
```

### Token assessment

Create a helper that validates a reCAPTCHA token server-side and returns whether it passes the risk threshold:

```ts title="src/util/recaptcha/assessRecaptchaToken.ts"
import { recaptchaClient, recaptchaResourceName } from "./recaptchaClient";

interface Options {
    token: string;
    action: string;
    siteKey: string;
    minimalRiskAnalysisScore?: number;
}

export const assessRecaptchaToken = async ({
    token,
    action,
    siteKey,
    minimalRiskAnalysisScore = 0.5,
}: Options): Promise<boolean> => {
    const [assessment] = await recaptchaClient.createAssessment({
        assessment: {
            event: { token, siteKey },
        },
        parent: recaptchaResourceName,
    });

    if (!assessment.tokenProperties?.valid) {
        return false;
    }

    if (assessment.tokenProperties.action === action) {
        return (
            assessment.riskAnalysis?.score != null &&
            assessment.riskAnalysis.score > minimalRiskAnalysisScore
        );
    }

    return false;
};
```

The default threshold of `0.5` is [recommended by Google](https://cloud.google.com/recaptcha/docs/interpret-assessment-website#handle_the_response). Adjust it based on your use case.

## Create a client-side token helper

Create a utility that loads the reCAPTCHA library and retrieves a token for a given action:

```ts title="src/util/recaptcha/getRecaptchaToken.ts"
/// <reference types="grecaptcha" />

export async function getRecaptchaToken(action: string, recaptchaKey: string): Promise<string> {
    if (!recaptchaKey) {
        return Promise.reject("Missing reCAPTCHA key");
    }

    if (typeof grecaptcha.enterprise === "undefined") {
        return Promise.reject("grecaptcha.enterprise is not defined");
    }

    return new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject("Failed to load reCAPTCHA library");
        }, 3000);
        grecaptcha.enterprise.ready(() => {
            window.clearTimeout(timeout);
            resolve();
        });
    }).then(() => {
        return grecaptcha.enterprise.execute(recaptchaKey, { action });
    });
}
```

## Pass the site key through site config

Extend the site config type to include `recaptchaSiteKey`:

```ts title="site-configs/site-configs.d.ts"
export interface SiteConfig extends BaseSiteConfig {
    // ...
    recaptchaSiteKey: string;
}
```

Set the value in each site config. The source depends on your project setup — read it from an environment variable, fetch it from 1Password, or hardcode it:

```ts title="site-configs/main.ts"
recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY ?? "",
```

## Load the reCAPTCHA script

Load the reCAPTCHA Enterprise script via the Next.js `<Script>` component in the component that renders the form.
Use the site key from the site config:

```tsx
import Script from "next/script";
import { useSiteConfig } from "@src/util/SiteConfigProvider";

const { recaptchaSiteKey } = useSiteConfig();

// Inside your JSX:
<Script src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`} />;
```

### Hide the reCAPTCHA badge and add a disclaimer

To hide the reCAPTCHA badge, add the following CSS to your form component's stylesheet:

```css title="YourFormBlock.module.scss"
:global(.grecaptcha-badge) {
    visibility: hidden;
}
```

When hiding the badge, Google [requires you to add a disclaimer](https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed) near the submit button instead:

```tsx
<p>
    This site is protected by reCAPTCHA and the Google{" "}
    <a href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
    <a href="https://policies.google.com/terms">Terms of Service</a> apply.
</p>
```

## Update the Content Security Policy

If your site defines a Content Security Policy, add the required Google domains:

```ts title="src/middleware/contentSecurityPolicyHeaders.ts"
{ directive: "connect-src", values: ["'self'", "https://www.google.com/recaptcha/"] },
{
    directive: "script-src-elem",
    values: ["'self'", "'unsafe-inline'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
},
{ directive: "frame-src", values: ["https://www.google.com/recaptcha/"] },
```

## Integrate reCAPTCHA in your form component

Before submitting the form, request a token and include it in the request body.
Handle both the case where the site key is missing and the case where the token request fails:

```tsx title="src/common/blocks/YourFormBlock.tsx"
"use client";
import { getRecaptchaToken } from "@src/util/recaptcha/getRecaptchaToken";
import { useSiteConfig } from "@src/util/SiteConfigProvider";
import { useIntl } from "react-intl";
import { useForm } from "react-hook-form";

const { recaptchaSiteKey } = useSiteConfig();
const intl = useIntl();
const { setError, handleSubmit } = useForm();

const onSubmit = async (formValues) => {
    if (!recaptchaSiteKey) {
        setError("root.serverError", {
            type: "manual",
            message: intl.formatMessage({
                id: "form.missingRecaptchaKey",
                defaultMessage: "The form is currently unavailable. Please try again later.",
            }),
        });
        return;
    }

    let recaptchaToken: string;
    try {
        recaptchaToken = await getRecaptchaToken("form_submit", recaptchaSiteKey);
    } catch (error) {
        console.error(error);
        setError("root.serverError", {
            type: "manual",
            message: intl.formatMessage({
                id: "form.recaptchaFailed",
                defaultMessage: "reCAPTCHA validation failed. Please try again.",
            }),
        });
        return;
    }

    // Include the token in the request body
    const response = await fetch("/api/your-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...formValues, recaptchaToken }),
    });
    // handle response...
};
```

## Validate the token in the API route

In your Next.js API route, validate the token before processing the form submission.
Use `getSiteConfigForDomain` to retrieve the site key at runtime:

```ts title="src/app/.../api/your-form/route.ts"
import { assessRecaptchaToken } from "@src/util/recaptcha/assessRecaptchaToken";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    // ...your other fields
    recaptchaToken: z.string(),
});

export async function POST(
    request: NextRequest,
    context: RouteContext<"/[visibility]/[domain]/[language]/api/your-form">,
) {
    const { domain } = await context.params;
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const siteConfig = getSiteConfigForDomain(domain);
    const recaptchaTokenValid = await assessRecaptchaToken({
        token: result.data.recaptchaToken,
        action: "form_submit",
        siteKey: siteConfig.recaptchaSiteKey,
    });

    if (!recaptchaTokenValid) {
        return NextResponse.json({ success: false, error: "reCAPTCHA assessment failed" });
    }

    // Process the form submission...
}
```

## Protecting file uploads

A file upload cannot follow the pattern above. Reading the reCAPTCHA token from the request body means calling
`request.formData()`, which buffers the entire file in the site's heap before the token is even looked at. Every
request — including those from bots with an invalid token — then costs as much memory as the file is large, which
makes the route an easy way to exhaust the site's memory.

Send the reCAPTCHA token in a request header instead, so the route can reject the request before reading the body:

```tsx title="src/common/components/form/FileUploadField.tsx"
const recaptchaToken = await getRecaptchaToken("file_upload", recaptchaSiteKey);

const body = new FormData();
body.append("file", file, file.name);

const response = await fetch(`/${language}/api/file-upload`, {
    method: "POST",
    headers: {
        "x-recaptcha-token": recaptchaToken,
        "x-file-type": file.type,
    },
    body,
});
```

In the route, validate everything that is available in the headers first, then pipe the body straight through to the
API instead of parsing it. Because `Content-Length` may be missing or forged, count the bytes flowing through the
stream as a second barrier:

```ts title="src/app/.../api/file-upload/route.ts"
// The multipart envelope (boundaries and part headers) adds a few hundred bytes on top of the file itself.
const multipartOverheadBytes = 4 * 1024;
const maxRequestSizeBytes = maxFileSizeBytes + multipartOverheadBytes;

const createSizeLimitedStream = (maxSizeBytes: number, onLimitExceeded: () => void) => {
    let bytesRead = 0;

    return new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            bytesRead += chunk.byteLength;

            if (bytesRead > maxSizeBytes) {
                onLimitExceeded();
                controller.error(new Error("File exceeds the maximum size"));
                return;
            }

            controller.enqueue(chunk);
        },
    });
};

export async function POST(
    request: NextRequest,
    context: RouteContext<"/[visibility]/[domain]/[language]/api/file-upload">,
) {
    if (Number(request.headers.get("content-length")) > maxRequestSizeBytes) {
        return NextResponse.json({ message: "File too large" }, { status: 413 });
    }

    const recaptchaToken = request.headers.get("x-recaptcha-token");
    // Validate the token, the file type and the presence of the body before touching the upload...

    let sizeLimitExceeded = false;

    const body = requestBody.pipeThrough(
        createSizeLimitedStream(maxRequestSizeBytes, () => {
            sizeLimitExceeded = true;
        }),
    );

    // duplex is required when streaming a request body, but is not part of the fetch types yet.
    const requestInit: RequestInit & { duplex: "half" } = {
        method: "POST",
        // The original content type carries the multipart boundary, so the API can separate the fields itself.
        headers: { "content-type": request.headers.get("content-type") ?? "" },
        body,
        duplex: "half",
    };

    const uploadResponse = await fetch(
        `${process.env.API_URL_INTERNAL}/file-uploads/upload`,
        requestInit,
    );

    // Handle the response, and turn a rejected stream into a 413 when sizeLimitExceeded is set...
}
```

The route no longer sees the parsed file, so it cannot validate the file's contents. That validation belongs to the
API anyway: `FileUploadsModule` checks the size and the mime type of the uploaded file. Pass its `4xx` rejections
through to the user, so a rejected file does not surface as a generic error.

See `FileUploadField` and the `api/file-upload` route in the demo site for a full implementation.
