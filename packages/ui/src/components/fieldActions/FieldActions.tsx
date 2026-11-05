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
    translate: string;
    aiAssist: string;
    suggestion: string;
    accept: string;
    discard: string;
}

const defaultLabels: FieldActionsLabels = {
    translate: "Translate",
    aiAssist: "Improve with AI",
    suggestion: "AI suggestion",
    accept: "Accept",
    discard: "Discard",
};

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
     * The locales passed to `onTranslate`. Leave empty to let the application ask for them.
     *
     * @defaultValue `[]`
     */
    targetLocales?: string[];
    /** Called when the user asks to translate the field's content. */
    onTranslate?: (targetLocales: string[]) => void;
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

    const [pending, setPending] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const controlId = field?.control.id;
    const latest = useRef({ onAiAccept, labels, controlId });
    latest.current = { onAiAccept, labels, controlId };
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
                aria-label={currentLabels.suggestion}
                tabIndex={-1}
            >
                <span className={styles.suggestionLabel} aria-hidden>
                    <Icon name="sparkle" />
                    {currentLabels.suggestion}
                </span>
                <p className={styles.suggestionText}>{suggestion}</p>
                <span className={styles.suggestionActions}>
                    <Button
                        size="small"
                        onClick={() => {
                            latest.current.onAiAccept?.(suggestion);
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

    async function requestSuggestion() {
        if (onAiSuggest == null || pending) {
            return;
        }
        setSuggestion(null);
        setPending(true);
        try {
            const result = await onAiSuggest();
            if (mounted.current) {
                setSuggestion(result);
            }
        } catch (error) {
            onAiError?.(error);
        } finally {
            if (mounted.current) {
                setPending(false);
            }
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
                <IconButton size="small" aria-label={labels.translate} disabled={disabled} onClick={() => onTranslate?.(targetLocales)}>
                    <Icon name="translate" />
                </IconButton>
            )}
            {aiAssist && (
                <IconButton size="small" aria-label={labels.aiAssist} disabled={disabled} loading={pending} onClick={requestSuggestion}>
                    <Icon name="sparkle" />
                </IconButton>
            )}
        </span>
    );
});
