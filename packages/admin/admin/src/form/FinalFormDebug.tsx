import { Box } from "@mui/material";
import { useState } from "react";
import { FormSpy } from "react-final-form";

import { Alert } from "../alert/Alert";
import { Button } from "../common/buttons/Button";

/**
 * A debug component for React Final Form that displays the complete form state in a collapsible panel.
 *
 * This component renders an info alert with an expandable section that shows all available form state properties
 * including values, errors, validation state, submission state, and field-level metadata. It's useful for
 * development and debugging purposes to inspect the current state of a Final Form.
 *
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit}>
 *   {() => (
 *     <>
 *       <Field name="email" component="input" />
 *       <FinalFormDebug />
 *     </>
 *   )}
 * </Form>
 * ```
 *
 * @remarks
 * The component subscribes to all form state properties and displays them as formatted JSON.
 * Use this only during development as it can impact performance with large forms.
 */
export function FinalFormDebug() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <FormSpy
            subscription={{
                dirty: true,
                dirtyFields: true,
                dirtySinceLastSubmit: true,
                errors: true,
                hasSubmitErrors: true,
                hasValidationErrors: true,
                invalid: true,
                pristine: true,
                submitError: true,
                submitErrors: true,
                submitFailed: true,
                submitSucceeded: true,
                submitting: true,
                touched: true,
                valid: true,
                validating: true,
                values: true,
                visited: true,
            }}
        >
            {(formState) => (
                <Alert severity="info" title="Debug Final Form State:">
                    <Box
                        sx={{
                            paddingTop: 2,
                        }}
                    >
                        <Button onClick={() => setIsExpanded(!isExpanded)} variant="outlined" size="small">
                            {isExpanded ? "Collapse" : "Expand"}
                        </Button>
                    </Box>
                    {isExpanded && <pre>{`${JSON.stringify(formState, null, 2)}`}</pre>}
                </Alert>
            )}
        </FormSpy>
    );
}
