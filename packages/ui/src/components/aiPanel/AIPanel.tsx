import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import styles from "./AIPanel.module.scss";

/**
 * An action offered in an assistant's answer, e.g. "Apply filter" or "Open page". It never changes content without the person's
 * confirmation.
 */
export interface AIPanelAction {
    label: string;
    onClick: () => void;
}

/**
 * One message of the conversation.
 */
export interface AIPanelMessage {
    /** Stable id. */
    id: string;
    /** `user` for the person's questions, `assistant` for the answers. */
    role: "user" | "assistant";
    /** The text; may be rich content such as a list or links. */
    content: ReactNode;
    /** Actions offered with an answer. */
    actions?: AIPanelAction[];
}

/**
 * A suggested question that fits the screen.
 */
export interface AIPanelSuggestion {
    /** Shown on the suggestion. */
    label: string;
    /** Sent when the suggestion is chosen. */
    prompt: string;
}

export interface AIPanelLabels {
    /** The panel's title and accessible name. */
    title: string;
    /** The close button. */
    close: string;
    /** The send button. */
    send: string;
    /** Placeholder and accessible name of the input. */
    placeholder: string;
    /** Accessible text of the typing indicator. */
    pending: string;
    /** Accessible name of the suggestions. */
    suggestions: string;
}

const defaultLabels: AIPanelLabels = {
    title: "AI assistant",
    close: "Close AI assistant",
    send: "Send",
    placeholder: "Ask the assistant …",
    pending: "The assistant is answering",
    suggestions: "Suggestions",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AIPanelOwnerState = {
    open: boolean;
    pending: boolean;
};

export interface AIPanelSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<AIPanelOwnerState, "div">;
    /** Props for the `messages` slot. */
    messages?: SlotPropsValue<AIPanelOwnerState, "div">;
    /** Props for the `composer` slot, the input area at the bottom. */
    composer?: SlotPropsValue<AIPanelOwnerState, "div">;
}

export interface AIPanelProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** Whether the panel is shown. */
    open: boolean;
    /** Called when the panel is closed with its close button. */
    onOpenChange: (open: boolean) => void;
    /** What the assistant is helping with, e.g. "Page tree · Austria · German". Always visible below the title. */
    context: string;
    /** The conversation, oldest first. The app supplies them, also while an answer streams in. */
    messages: AIPanelMessage[];
    /** Suggested questions that fit the screen; choosing one sends its prompt. */
    suggestions?: AIPanelSuggestion[];
    /** The text in the input. */
    value: string;
    /** Called with the new text when the input changes. */
    onValueChange: (value: string) => void;
    /** Called with the question when it is sent with Enter or the send button; Shift+Enter adds a line. */
    onSend: (prompt: string) => void;
    /**
     * Shows the typing indicator while the assistant prepares an answer.
     *
     * @defaultValue `false`
     */
    pending?: boolean;
    /** A note below the input, e.g. that AI answers need checking. */
    note?: string;
    /** The built-in texts. */
    labels?: Partial<AIPanelLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AIPanelSlotProps;
}

/**
 * The AI assistant as a glass panel: title and context, the conversation with actions to check, suggestions for the screen, and the
 * input. Content changes only through actions the person confirms.
 */
export const AIPanel = forwardRef<HTMLElement, AIPanelProps>(function AIPanel(
    {
        open,
        onOpenChange,
        context,
        messages,
        suggestions,
        value,
        onValueChange,
        onSend,
        pending = false,
        note,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: AIPanelOwnerState = { open, pending };
    const titleId = useId();
    const canSend = value.trim().length > 0;

    function send() {
        if (canSend) {
            onSend(value.trim());
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            send();
        }
    }

    const headerProps = resolveSlotProps<AIPanelOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const messagesProps = resolveSlotProps<AIPanelOwnerState, "div", "div">({
        ownProps: { className: styles.messages, role: "log", "aria-live": "polite", "aria-busy": ownerState.pending || undefined },
        slotProps: slotProps?.messages,
        ownerState,
    });
    const composerProps = resolveSlotProps<AIPanelOwnerState, "div", "div">({
        ownProps: { className: styles.composer },
        slotProps: slotProps?.composer,
        ownerState,
    });

    return (
        <aside
            aria-labelledby={titleId}
            {...restProps}
            ref={ref}
            hidden={!ownerState.open}
            data-open={ownerState.open ? "" : undefined}
            data-pending={ownerState.pending ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headerProps}>
                <span className={styles.orb}>
                    <Icon name="artificial-intelligence" />
                </span>
                <span className={styles.heading}>
                    <span id={titleId} className={styles.title}>
                        {labels.title}
                    </span>
                    <span className={styles.context}>{context}</span>
                </span>
                <IconButton
                    variant="text"
                    color="secondary"
                    aria-label={labels.close}
                    size="small"
                    onClick={() => onOpenChange(false)}
                    className={styles.closeButton}
                >
                    <Icon name="close" />
                </IconButton>
            </div>
            <div {...messagesProps}>
                {messages.map((message) => (
                    <div key={message.id} className={styles.message} data-role={message.role}>
                        <div className={styles.messageContent}>{message.content}</div>
                        {message.actions != null && message.actions.length > 0 && (
                            <div className={styles.messageActions}>
                                {message.actions.map((action) => (
                                    <Button key={action.label} variant="outlined" color="secondary" size="small" onClick={action.onClick}>
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {ownerState.pending && (
                    <div className={clsx(styles.message, styles.typing)} data-role="assistant" role="status" aria-label={labels.pending}>
                        <span />
                        <span />
                        <span />
                    </div>
                )}
            </div>
            {suggestions != null && suggestions.length > 0 && (
                <div className={styles.suggestions} role="group" aria-label={labels.suggestions}>
                    {suggestions.map((suggestion) => (
                        <button key={suggestion.prompt} type="button" className={styles.suggestion} onClick={() => onSend(suggestion.prompt)}>
                            <Icon name="artificial-intelligence" />
                            {suggestion.label}
                        </button>
                    ))}
                </div>
            )}
            <div {...composerProps}>
                <div className={styles.inputBox}>
                    <textarea
                        aria-label={labels.placeholder}
                        placeholder={labels.placeholder}
                        rows={1}
                        value={value}
                        onChange={(event) => onValueChange(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                    />
                    <IconButton
                        variant="text"
                        color="secondary"
                        aria-label={labels.send}
                        disabled={!canSend}
                        onClick={send}
                        className={styles.sendButton}
                    >
                        <Icon name="arrow-up" />
                    </IconButton>
                </div>
                {note != null && <p className={styles.note}>{note}</p>}
            </div>
        </aside>
    );
});
