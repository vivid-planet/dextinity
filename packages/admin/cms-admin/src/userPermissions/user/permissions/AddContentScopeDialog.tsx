import { Dialog, DialogFormActions, Skeleton } from "@dextinity/ui";
import { focusOnError } from "@dextinity/ui-react-final-form";
import { useId, useMemo } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../../contentScope/Provider";
import { getContentScopeKey, isContentScopeCoveredBy } from "./selectScopesDialogContent/contentScopeSelection";
import {
    getScopesToAdd,
    SelectScopesDialogContent,
    type SelectScopesFormValues,
    useAvailableContentScopesQuery,
    validateSelectScopes,
} from "./selectScopesDialogContent/SelectScopesDialogContent";

interface AddContentScopeDialogProps {
    open: boolean;
    onClose: () => void;
    /** The scopes that are assigned already; they are shown checked and can't be added again. */
    assignedScopes: ContentScope[];
    /** Called with the scopes selected in the dialog. The dialog closes after this resolves. */
    onAdd: (scopes: ContentScope[]) => Promise<void> | void;
}

const formDecorators = [focusOnError];

export function AddContentScopeDialog({ open, onClose, assignedScopes, onAdd }: AddContentScopeDialogProps) {
    const intl = useIntl();
    const formId = useId();
    const { data, error } = useAvailableContentScopesQuery();
    const assignedScopeKeysSignature = JSON.stringify(assignedScopes.map(getContentScopeKey).sort());
    // The parent passes a new list on every render, so the keys are compared by value to keep the form from being reset
    const assignedScopeKeys = useMemo(() => {
        const assignedScopes: ContentScope[] = JSON.parse(assignedScopeKeysSignature).map((key: string) => Object.fromEntries(JSON.parse(key)));
        const coveredScopeKeys = (data?.availableContentScopes ?? [])
            .filter((availableContentScope) =>
                assignedScopes.some((assignedScope) => isContentScopeCoveredBy({ availableScope: availableContentScope.scope, assignedScope })),
            )
            .map((availableContentScope) => getContentScopeKey(availableContentScope.scope));
        return new Set([...assignedScopes.map(getContentScopeKey), ...coveredScopeKeys]);
    }, [assignedScopeKeysSignature, data]);
    const initialValues = useMemo<SelectScopesFormValues>(
        () => ({ mode: "available", scopeKeys: [...assignedScopeKeys], scope: {} }),
        [assignedScopeKeys],
    );

    if (error) {
        throw new Error(error.message);
    }

    const title = intl.formatMessage({ id: "dextinity.userPermissions.addScope", defaultMessage: "Add scope" });
    const messages = {
        selectScope: intl.formatMessage({ id: "dextinity.userPermissions.selectScope", defaultMessage: "Select at least one scope." }),
        selectValue: intl.formatMessage({ id: "dextinity.userPermissions.selectValue", defaultMessage: "Select a value." }),
        enterValue: intl.formatMessage({ id: "dextinity.userPermissions.enterValue", defaultMessage: "Enter a value (* for all)." }),
        combinationDoesNotExist: intl.formatMessage({
            id: "dextinity.userPermissions.contentScopeDoesNotExist",
            defaultMessage: "This combination of scopes does not exist.",
        }),
    };

    if (!open) {
        return null;
    }

    return (
        <Form<SelectScopesFormValues>
            initialValues={initialValues}
            decorators={formDecorators}
            validate={(values) => (data ? validateSelectScopes({ values, data, assignedScopeKeys, messages }) : {})}
            onSubmit={async (values) => {
                if (!data) {
                    return;
                }
                await onAdd(getScopesToAdd({ values, availableContentScopes: data.availableContentScopes, assignedScopeKeys }));
                onClose();
            }}
        >
            {({ handleSubmit, submitting }) => (
                <Dialog
                    open
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            onClose();
                        }
                    }}
                    dismissible={!submitting}
                    title={title}
                    description={intl.formatMessage({
                        id: "dextinity.userPermissions.addScope.description",
                        defaultMessage: "The user gets access to the content of the chosen scopes.",
                    })}
                    footer={
                        <DialogFormActions
                            formId={formId}
                            submitLabel={title}
                            onCancel={onClose}
                            submitting={submitting}
                            submitDisabled={!data}
                            labels={{ cancel: intl.formatMessage({ id: "dextinity.userPermissions.cancel", defaultMessage: "Cancel" }) }}
                        />
                    }
                >
                    <form id={formId} onSubmit={handleSubmit} noValidate>
                        {data ? (
                            <SelectScopesDialogContent data={data} assignedScopeKeys={assignedScopeKeys} />
                        ) : (
                            <Skeleton variant="row" count={4} />
                        )}
                    </form>
                </Dialog>
            )}
        </Form>
    );
}
