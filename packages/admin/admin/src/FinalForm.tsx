import { getApolloContext } from "@apollo/client";
import {
    type Config,
    type Decorator,
    FORM_ERROR,
    type FormApi,
    type FormSubscription,
    type MutableState,
    type Mutator,
    type SubmissionErrors,
    type ValidationErrors,
} from "final-form";
import setFieldData from "final-form-set-field-data";
import { type PropsWithChildren, type RefObject, useCallback, useContext, useEffect, useRef } from "react";
import { type AnyObject, Form, type FormRenderProps, FormSpy, type RenderableProps } from "react-final-form";
import { useIntl } from "react-intl";

import { type FinalFormContext, FinalFormContextProvider } from "./form/FinalFormContextProvider";
import { messages } from "./messages";
import { renderFinalFormChildren } from "./renderFinalFormChildren";
import { RouterPrompt } from "./router/Prompt";
import { useSubRoutePrefix } from "./router/SubRoute";
import { Savable, useSaveBoundaryApi } from "./saveBoundary/SaveBoundary";
import { TableQueryContext } from "./table/TableQueryContext";

export const useFormApiRef = <FormValues = Record<string, any>, InitialFormValues = Partial<FormValues>>() =>
    useRef<FormApi<FormValues, InitialFormValues>>(undefined);

// copy of FormProps from final-form, because Omit doen't work on it
interface IProps<FormValues = Record<string, any>, InitialFormValues = Partial<FormValues>>
    extends Omit<Config<FormValues, InitialFormValues>, "onSubmit">, RenderableProps<FormRenderProps<FormValues, InitialFormValues>> {
    subscription?: FormSubscription;
    decorators?: Array<Decorator<FormValues, InitialFormValues>>;
    form?: FormApi<FormValues, InitialFormValues>;
    initialValuesEqual?: (a?: AnyObject, b?: AnyObject) => boolean;
    [otherProp: string]: any;

    mode: "edit" | "add";
    resolveSubmitErrors?: (error: SubmissionErrors) => SubmissionErrors;

    // override final-form onSubmit and remove callback as we don't support that (return promise instead)
    onSubmit: (
        values: FormValues,
        form: FormApi<FormValues, InitialFormValues>,
        event: FinalFormSubmitEvent,
    ) => SubmissionErrors | Promise<SubmissionErrors | undefined> | undefined | void;

    /**
     * This method will be called at the end of a submit process.
     */
    onAfterSubmit?: (values: FormValues, form: FormApi<FormValues, InitialFormValues>) => void;
    validateWarning?: (values: FormValues) => ValidationErrors | Promise<ValidationErrors> | undefined;
    formContext?: Partial<FinalFormContext>;
    apiRef?: RefObject<FormApi<FormValues, InitialFormValues> | undefined>;
    subRoutePath?: string;
}

declare module "final-form" {
    interface InternalFormState {
        submitEvent: any;
    }
}

const setSubmitEvent: Mutator<any, any> = (args: any[], state: MutableState<any, any>) => {
    const [event] = args;
    state.formState.submitEvent = event;
};
const getSubmitEvent: Mutator<any, any> = (args: any[], state: MutableState<any, any>) => {
    return state.formState.submitEvent;
};

const RouterPromptIf = ({
    children,
    doSave,
    subRoutePath,
    formApi,
}: PropsWithChildren<{
    doSave: () => Promise<boolean>;
    subRoutePath: string;
    formApi: FormApi<any>;
}>) => {
    const saveBoundaryApi = useSaveBoundaryApi();
    const intl = useIntl();

    if (saveBoundaryApi) {
        //render no RouterPrompt if we are inside a SaveBoundary
        return <>{children}</>;
    }
    return (
        <RouterPrompt
            message={() => {
                if (formApi.getState().dirty) {
                    return intl.formatMessage(messages.saveUnsavedChanges);
                }
                return true;
            }}
            saveAction={doSave}
            resetAction={() => formApi.reset()}
            subRoutePath={subRoutePath}
        >
            {children}
        </RouterPrompt>
    );
};

export class FinalFormSubmitEvent extends Event {
    navigatingBack?: boolean;
}

export function FinalForm<FormValues = AnyObject, InitialFormValues = Partial<FormValues>>(props: IProps<FormValues, InitialFormValues>) {
    const { client } = useContext(getApolloContext());
    const tableQuery = useContext(TableQueryContext);

    const { onAfterSubmit, validateWarning } = props;

    return (
        <Form<FormValues, InitialFormValues>
            {...props}
            mutators={{
                ...props.mutators,
                setFieldData: setFieldData as unknown as Mutator<FormValues, InitialFormValues>,
                setSubmitEvent: setSubmitEvent as unknown as Mutator<FormValues, InitialFormValues>,
                getSubmitEvent: getSubmitEvent as unknown as Mutator<FormValues, InitialFormValues>,
            }}
            onSubmit={handleSubmit}
            render={RenderForm}
        />
    );

    function RenderForm({
        formContext = {},
        ...formRenderProps
    }: FormRenderProps<FormValues, InitialFormValues> & { formContext: Partial<FinalFormContext> }) {
        const subRoutePrefix = useSubRoutePrefix();
        const saveBoundaryApi = useSaveBoundaryApi();
        // Explicit cast to set InitialFormValues because FormRenderProps doesn't pass InitialFormValues to RenderableProps here:
        // https://github.com/final-form/react-final-form/blob/main/typescript/index.d.ts#L56-L67.
        // See https://github.com/final-form/react-final-form/pull/998.
        if (props.apiRef) {
            props.apiRef.current = formRenderProps.form as FormApi<FormValues, InitialFormValues>;
        }
        const { mutators } = formRenderProps.form;
        const setFieldData = mutators.setFieldData as (...args: any[]) => any;
        const subRoutePath = props.subRoutePath ?? `${subRoutePrefix}/form`;

        const submit = useCallback(
            (event: any) => {
                event.preventDefault(); //  Prevents from reloading the page with GET-params on submit
                if (saveBoundaryApi) {
                    // if we are inside a SaveBoundary, save the whole SaveBoundary
                    return saveBoundaryApi.save();
                }
                if (!formRenderProps.dirty) {
                    return;
                }
                return new Promise<SubmissionErrors | void>((resolve) => {
                    Promise.resolve(formRenderProps.handleSubmit(event)).then(
                        () => {
                            if (formRenderProps.submitSucceeded) {
                                resolve();
                            } else {
                                resolve(formRenderProps.submitErrors);
                            }
                        },
                        (error) => {
                            resolve(error);
                        },
                    );
                });
            },
            [formRenderProps, saveBoundaryApi],
        );

        const currentWarningValidationRound = useRef(0);

        const registeredFields = formRenderProps.form.getRegisteredFields();

        const formLevelWarnings = useRef<Record<string, string | undefined>>({});

        useEffect(() => {
            if (validateWarning) {
                const validate = async () => {
                    currentWarningValidationRound.current++;
                    const validationRound = currentWarningValidationRound.current;

                    const validationWarnings = await Promise.resolve(validateWarning(formRenderProps.values));

                    if (currentWarningValidationRound.current > validationRound) {
                        // Another validation has been started, skip this one
                        return;
                    }

                    if (!validationWarnings) {
                        registeredFields.forEach((fieldName) => {
                            const hasFormLevelWarning = Boolean(formLevelWarnings.current[fieldName]);
                            if (hasFormLevelWarning) {
                                setFieldData(fieldName, { warning: undefined });
                            }
                        });
                        formLevelWarnings.current = {};
                        return;
                    }

                    formLevelWarnings.current = validationWarnings;

                    Object.entries(validationWarnings).forEach(([fieldName, warning]) => {
                        setFieldData(fieldName, { warning });
                    });
                };

                validate();
            }
        }, [formRenderProps.values, setFieldData, registeredFields]);

        const doSave = useCallback(async () => {
            const hasValidationErrors = await waitForValidationToFinish(formRenderProps.form);

            const submissionErrors = await formRenderProps.form.submit();
            if (hasValidationErrors || submissionErrors) {
                return false;
            }

            return true;
        }, [formRenderProps.form]);
        const doReset = useCallback(() => {
            formRenderProps.form.reset();
        }, [formRenderProps.form]);
        return (
            <FinalFormContextProvider {...formContext}>
                {saveBoundaryApi && (
                    <FormSpy subscription={{ dirty: true }}>
                        {(props) => {
                            return (
                                <Savable
                                    hasChanges={props.dirty}
                                    doSave={doSave}
                                    doReset={doReset}
                                    checkForChanges={() => {
                                        return formRenderProps.form.getState().dirty;
                                    }}
                                />
                            );
                        }}
                    </FormSpy>
                )}
                <RouterPromptIf formApi={formRenderProps.form} doSave={doSave} subRoutePath={subRoutePath}>
                    <form onSubmit={submit}>
                        <div>
                            {renderFinalFormChildren<FormValues, InitialFormValues>(
                                {
                                    children: props.children,
                                    component: props.component,
                                    render: props.render,
                                },
                                formRenderProps,
                            )}
                        </div>
                        {(formRenderProps.submitError || formRenderProps.error) && (
                            <div className="error">{formRenderProps.submitError || formRenderProps.error}</div>
                        )}
                    </form>
                </RouterPromptIf>
            </FinalFormContextProvider>
        );
    }

    async function handleSubmit(values: FormValues, form: FormApi<FormValues, InitialFormValues>) {
        const submitEvent = (form.mutators.getSubmitEvent ? form.mutators.getSubmitEvent() : undefined) || new FinalFormSubmitEvent("submit");
        const ret = props.onSubmit(values, form, submitEvent);
        if (ret === undefined) {
            return ret;
        }

        return Promise.resolve(ret)
            .then((data) => {
                // setTimeout is required because of https://github.com/final-form/final-form/pull/229
                setTimeout(() => {
                    if (props.mode === "add") {
                        if (tableQuery) {
                            // refetch TableQuery after adding
                            client?.query({
                                query: tableQuery.api.getQuery(),
                                variables: tableQuery.api.getVariables(),
                                fetchPolicy: "network-only",
                            });
                        }
                    }

                    onAfterSubmit?.(values, form);
                });
                return data;
            })
            .then(
                (data) => {
                    // for final-form undefined means success, an obj means error
                    form.reset(values as unknown as InitialFormValues);
                    return data;
                },
                (error) => {
                    if (props.resolveSubmitErrors) {
                        return props.resolveSubmitErrors(error);
                    }
                    // resolve with FORM_ERROR
                    return Promise.resolve({
                        [FORM_ERROR]: error.toString(),
                    });
                },
            );
    }
}

const waitForValidationToFinish = (form: FormApi<any>): Promise<boolean> | boolean => {
    const formState = form.getState();
    if (!formState.validating) {
        return formState.hasValidationErrors;
    }

    return new Promise((resolve) => {
        const unsubscribe = form.subscribe(
            (state) => {
                if (!state.validating) {
                    unsubscribe();
                    resolve(state.hasValidationErrors);
                }
            },
            { validating: true, hasValidationErrors: true },
        );
    });
};
