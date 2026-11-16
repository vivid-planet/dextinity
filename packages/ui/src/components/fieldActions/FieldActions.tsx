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
};

/**
 * Texts of the field actions, for translation.
 */
export interface FieldActionsLabels {
    /** The accessible name of the translate button. */
    translate: string;
    /** The heading and accessible name of a translation from `onTranslateSuggest`. */
    translation: string;
    /** The button that applies the translation. */
    accept: string;
    /** The button that drops the translation. */
    discard: string;
}

const defaultLabels: FieldActionsLabels = {
    translate: "Translate",
    translation: "Translation",
    accept: "Accept",
    discard: "Discard",
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function";
}

export interface FieldActionsProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children" | "translate"> {
    /**
     * Shows "Translate". Only for fields with content per language.
     *
     * @defaultValue `false`
     */
    translate?: boolean;
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
     * resolves, then offers the translation to accept or discard.
     */
    onTranslateSuggest?: () => Promise<string>;
    /** Called when the user accepts the translation from `onTranslateSuggest`; set the field's value from it. */
    onTranslateAccept?: (translation: string) => void;
    /** Called when the promise of `onTranslate` or `onTranslateSuggest` rejects. */
    onTranslateError?: (error: unknown) => void;
    /** Texts of the action and the translation to review, for translation. */
    labels?: Partial<FieldActionsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Translate at a field's label. Pass it to a field's `actions`; the field shows the loading state and the translation to review.
 */
export const FieldActions = forwardRef<HTMLSpanElement, FieldActionsProps>(function FieldActions(
    {
        translate = false,
        targetLocales = [],
        onTranslate,
        onTranslateSuggest,
        onTranslateAccept,
        onTranslateError,
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const ownerState: FieldActionsOwnerState = { translate };
    const labels = { ...defaultLabels, ...labelsProp };
    const field = useFieldContext();
    const setActionPending = field?.setActionPending;
    const setActionContent = field?.setActionContent;
    const disabled = field != null && (field.ownerState.disabled || field.ownerState.readOnly);

    const [pending, setPending] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const controlId = field?.control.id;
    const latest = useRef({ onTranslateAccept, labels, controlId });
    latest.current = { onTranslateAccept, labels, controlId };
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
                aria-label={currentLabels.translation}
                tabIndex={-1}
            >
                <span className={styles.suggestionLabel} aria-hidden>
                    <Icon name="translate" />
                    {currentLabels.translation}
                </span>
                <p className={styles.suggestionText}>{suggestion}</p>
                <span className={styles.suggestionActions}>
                    <Button
                        size="small"
                        onClick={() => {
                            latest.current.onTranslateAccept?.(suggestion);
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

    async function run(task: () => unknown, suggests: boolean) {
        if (pending) {
            return;
        }
        setSuggestion(null);
        try {
            const result = task();
            if (!isPromiseLike(result)) {
                return;
            }
            setPending(true);
            const text: unknown = await result;
            if (suggests && mounted.current && typeof text === "string") {
                setSuggestion(text);
            }
        } catch (error) {
            onTranslateError?.(error);
        } finally {
            if (mounted.current) {
                setPending(false);
            }
        }
    }

    function translateContent() {
        if (onTranslateSuggest != null) {
            void run(onTranslateSuggest, true);
        } else if (onTranslate != null) {
            void run(() => onTranslate(targetLocales), false);
        }
    }

    return (
        <span {...restProps} ref={ref} className={clsx(styles.root, className)} data-translate={ownerState.translate ? "" : undefined}>
            {translate && (
                <IconButton
                    variant="text"
                    color="secondary"
                    size="small"
                    aria-label={labels.translate}
                    disabled={disabled}
                    loading={pending}
                    onClick={translateContent}
                >
                    <Icon name="translate" />
                </IconButton>
            )}
        </span>
    );
});
