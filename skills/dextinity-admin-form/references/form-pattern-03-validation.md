# Field Validation

All field components (`TextField`, `NumberField`, `SelectField`, etc.) support a `validate` prop from Final Form. Use it to add client-side validation that shows an error message below the field.

## Rules

- **Never create validator functions inside a render function or component body.** Validators must be stable references — creating them inline causes the field to re-register on every render. Always define validators in a separate file and import them.
- Validator functions return `undefined` when valid, or a `ReactElement` (typically `<FormattedMessage>`) when invalid.
- For parameterized validators (e.g. max length), use a factory function that returns the validator.
- Validators live in a shared directory (e.g. `src/common/validators/`) and are reused across forms.
- Use `<FormattedMessage>` for error messages (not `intl.formatMessage()`) to keep them translatable and as `ReactElement`.

## Simple Validator

```tsx
// src/common/validators/validateLatitude.ts
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";

export const validateLatitude = (value: number | undefined): ReactElement | undefined => {
    if (value == null) return undefined;
    if (value < -90 || value > 90) {
        return <FormattedMessage id="validation.latitude" defaultMessage="Latitude must be between -90 and 90" />;
    }
    return undefined;
};
```

## Parameterized Validator (Factory)

Use a factory function when the validation rule depends on a parameter:

```tsx
// src/common/validators/validateMaxLength.ts
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";

export const validateMaxLength = (maxLength: number) => {
    return (value: string): ReactElement | undefined => {
        if (value && value.length > maxLength) {
            return (
                <FormattedMessage id="validation.maxLength" defaultMessage="Value must be at most {maxLength} characters" values={{ maxLength }} />
            );
        }
        return undefined;
    };
};
```

## Using validator.js for Complex Validation

For validation rules beyond simple range checks (e.g. email, URL, ISBN, credit card), use the **`validator`** package (validator.js). It is a lightweight, string-only validation library well-suited for frontend form validation.

### Setup

Add `validator` and `@types/validator` to your package:

```bash
npm install validator
npm install -D @types/validator
```

### Email Validator

```tsx
// src/common/validators/validateEmail.tsx
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";
import validator from "validator";

export const validateEmail = (value?: string): ReactElement | undefined => {
    if (value && !validator.isEmail(value)) {
        return <FormattedMessage id="validation.email" defaultMessage="Invalid email address" />;
    }
    return undefined;
};
```

### URL Validator

```tsx
// src/common/validators/validateUrl.tsx
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";
import validator from "validator";

export const validateUrl = (value?: string): ReactElement | undefined => {
    if (value && !validator.isURL(value)) {
        return <FormattedMessage id="validation.url" defaultMessage="Invalid URL" />;
    }
    return undefined;
};
```

### Numeric Range Validator (Latitude/Longitude)

```tsx
// src/common/validators/validateLatitude.tsx
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";
import validator from "validator";

export const validateLatitude = (value: number | undefined): ReactElement | undefined => {
    if (value == null) return undefined;
    if (!validator.isFloat(String(value), { min: -90, max: 90 })) {
        return <FormattedMessage id="validation.latitude" defaultMessage="Latitude must be between -90 and 90" />;
    }
    return undefined;
};
```

## Array Count Validator

```tsx
// src/common/validators/validateMaxArrayCount.ts
import { type ReactElement } from "react";
import { FormattedMessage } from "react-intl";

export const validateMaxArrayCount = (maxCount: number) => {
    return (value: unknown): ReactElement | undefined => {
        if (Array.isArray(value) && value.length > maxCount) {
            return (
                <FormattedMessage
                    id="validation.maxArrayCount"
                    defaultMessage="A maximum of {maxCount} items can be selected"
                    values={{ maxCount }}
                />
            );
        }
        return undefined;
    };
};
```

## Usage in Forms

```tsx
import { validateLatitude } from "@src/common/validators/validateLatitude";
import { validateMaxLength } from "@src/common/validators/validateMaxLength";

// Simple validator — pass directly (stable reference from module scope)
<NumberField name="latitude" validate={validateLatitude} ... />

// Parameterized validator — call at module scope or in useMemo, NOT inline
const validateTitle = validateMaxLength(120);

<TextField name="title" validate={validateTitle} ... />
```

## Composing Validators

To apply multiple validators to a single field, use `composeValidators`:

```tsx
const composeValidators = (...validators: ((value: any) => ReactElement | undefined)[]) => {
    return (value: any): ReactElement | undefined => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return undefined;
    };
};

// Usage:
<TextField name="email" validate={composeValidators(validateRequired, validateEmail)} ... />
```
