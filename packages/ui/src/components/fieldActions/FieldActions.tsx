import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useRef, useState } from "react";

import { Button } from "../button/Button";
import { useFieldContext } from "../field/fieldContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import styles from "./FieldActions.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FieldActionsOwnerState = {
    translate: boolean;
    aiassist: boolean;
};

/**
 * Texts of the field actions, for translation.
 */
export interface FieldActionsLabels {
    /** The accessible name of the translate button. */
    translate: string;
    /** The accessible name of the AI button. */
    aiAssist: string;
    /** The heading and accessible name of a suggestion from `onAiSuggest`. */
    suggestion: string;
    /** The heading and accessible name of a translation from `onTranslateSuggest`. */
    translation: string;
    /** The button that applies the suggestion or translation. */
    accept: string;
    /** The button that drops the suggestion or translation. */
    discard: string;
}

const defaultLabels: FieldActionsLabels = {
    translate: "Translate",
    aiAssist: "Improve with AI",
    suggestion: "AI suggestion",
    translation: "Translation",
    accept: "Accept",
    discard: "Discard",
};

type FieldAction = "translate" | "aiAssist";

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}

interface Suggestion {
    action: FieldAction;
    text: string;
}

export interface FieldActionsProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children" | "translate"> {
    /**
     * Shows "Translate". Only for fields with content per language.
     *
     * @defaultValue `false`
     */
    translate?: boolean;
    /**
     * Shows "Improve with AI".
     *
     * @defaultValue `false`
     */
    aiAssist?: boolean;
    /**
     * The locales passed to `onTranslate`, to translate the content into other locales. Leave empty when `onTranslate` translates the field's
     * content in place or asks for the locales itself, e.g. with a locale picker.
     *
     * @defaultValue `[]`
     */
    targetLocales?: string[];
    /**
     * Called when the user clicks "Translate", with `targetLocales`. Without target locales, a single click translates the field's content
     * in place, e.g. with cms-admin's content translation service: translate and set the value in the handler. Return a promise to show the
     * field as loading until it settles; a rejection goes to `onTranslateError`.
     */
    onTranslate?: (targetLocales: string[]) => unknown;
    /**
     * Instead of `onTranslate`: delivers the translation of the field's content for the user to review. The field shows as loading until it
     * resolves, then offers the translation to accept or discard, like an AI suggestion.
     */
    onTranslateSuggest?: () => Promise<string>;
    /** Called when the user accepts the translation from `onTranslateSuggest`; set the field's value from it. */
    onTranslateAccept?: (translation: string) => void;
    /** Called when the promise of `onTranslate` or `onTranslateSuggest` rejects. */
    onTranslateError?: (error: unknown) => void;
    /** Delivers the suggestion. The field shows as loading until it resolves, then offers the suggestion to accept or discard. */
    onAiSuggest?: () => Promise<string>;
    /** Called when the user accepts the suggestion; set the field's value from it. */
    onAiAccept?: (suggestion: string) => void;
    /** Called when `onAiSuggest` fails. */
    onAiError?: (error: unknown) => void;
    /** Texts of the actions and the suggestion, for translation. */
    labels?: Partial<FieldActionsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Translate and AI at a field's label. Pass it to a field's `actions`; the field shows the loading state and the suggestion.
 */
export const FieldActions = forwardRef<HTMLSpanElement, FieldActionsProps>(function FieldActions(
    {
        translate = false,
        aiAssist = false,
        targetLocales = [],
        onTranslate,
        onTranslateSuggest,
        onTranslateAccept,
        onTranslateError,
        onAiSuggest,
        onAiAccept,
        onAiError,
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const ownerState: FieldActionsOwnerState = { translate, aiassist: aiAssist };
    const labels = { ...defaultLabels, ...labelsProp };
    const field = useFieldContext();
    const setActionPending = field?.setActionPending;
    const setActionContent = field?.setActionContent;
    const disabled = field != null && (field.ownerState.disabled || field.ownerState.readOnly);

    const [pendingAction, setPendingAction] = useState<FieldAction | null>(null);
    const pending = pendingAction != null;
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

    const controlId = field?.control.id;
    const latest = useRef({ onAiAccept, onTranslateAccept, labels, controlId });
    latest.current = { onAiAccept, onTranslateAccept, labels, controlId };
    const suggestionRef = useRef<HTMLDivElement | null>(null);

    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        setActionPending?.(pending);
    }, [pending, setActionPending]);

    useEffect(() => {
        if (setActionContent == null) {
            return;
        }
        if (suggestion == null) {
            setActionContent(null);
            return;
        }
        const { labels: currentLabels } = latest.current;
        const isTranslation = suggestion.action === "translate";
        const close = () => {
            setSuggestion(null);
            const id = latest.current.controlId;
            if (id != null) {
                suggestionRef.current?.ownerDocument.getElementById(id)?.focus();
            }
        };
        setActionContent(
            <div
                ref={(element) => {
                    suggestionRef.current = element;
                    element?.focus();
                }}
                className={styles.suggestion}
                role="group"
                aria-label={isTranslation ? currentLabels.translation : currentLabels.suggestion}
                tabIndex={-1}
                data-action={suggestion.action}
            >
                <span className={styles.suggestionLabel} aria-hidden>
                    <Icon name={isTranslation ? "translate" : "sparkle"} />
                    {isTranslation ? currentLabels.translation : currentLabels.suggestion}
                </span>
                <p className={styles.suggestionText}>{suggestion.text}</p>
                <span className={styles.suggestionActions}>
                    <Button
                        size="small"
                        onClick={() => {
                            if (isTranslation) {
                                latest.current.onTranslateAccept?.(suggestion.text);
                            } else {
                                latest.current.onAiAccept?.(suggestion.text);
                            }
                            close();
                        }}
                    >
                        {currentLabels.accept}
                    </Button>
                    <Button size="small" variant="text" color="secondary" onClick={close}>
                        {currentLabels.discard}
                    </Button>
                </span>
            </div>,
        );
    }, [suggestion, setActionContent]);

    useEffect(
        () => () => {
            setActionContent?.(null);
            setActionPending?.(false);
        },
        [setActionContent, setActionPending],
    );

    async function run(action: FieldAction, task: () => unknown, onError: ((error: unknown) => void) | undefined, suggests: boolean) {
        if (pending) {
            return;
        }
        setSuggestion(null);
        try {
            const result = task();
            if (!isPromiseLike(result)) {
                return;
            }
            setPendingAction(action);
            const text: unknown = await result;
            if (suggests && mounted.current && typeof text === "string") {
                setSuggestion({ action, text });
            }
        } catch (error) {
            onError?.(error);
        } finally {
            if (mounted.current) {
                setPendingAction(null);
            }
        }
    }

    function translateContent() {
        if (onTranslateSuggest != null) {
            void run("translate", onTranslateSuggest, onTranslateError, true);
        } else if (onTranslate != null) {
            void run("translate", () => onTranslate(targetLocales), onTranslateError, false);
        }
    }

    function requestSuggestion() {
        if (onAiSuggest != null) {
            void run("aiAssist", onAiSuggest, onAiError, true);
        }
    }

    return (
        <span
            {...restProps}
            ref={ref}
            className={clsx(styles.root, className)}
            data-translate={ownerState.translate ? "" : undefined}
            data-aiassist={ownerState.aiassist ? "" : undefined}
        >
            {translate && (
                <IconButton
                    size="small"
                    aria-label={labels.translate}
                    disabled={disabled}
                    loading={pendingAction === "translate"}
                    onClick={translateContent}
                >
                    <Icon name="translate" />
                </IconButton>
            )}
            {aiAssist && (
                <IconButton
                    size="small"
                    aria-label={labels.aiAssist}
                    disabled={disabled}
                    loading={pendingAction === "aiAssist"}
                    onClick={requestSuggestion}
                >
                    <Icon name="sparkle" />
                </IconButton>
            )}
        </span>
    );
});
