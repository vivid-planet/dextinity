import { useState } from "react";

import { Button } from "../components/button/Button";
import { Icon } from "../components/icon/Icon";
import { IconButton } from "../components/iconButton/IconButton";
import { Panel } from "../components/panel/Panel";
import { Textarea } from "../components/textarea/Textarea";
import styles from "./StoryAssistant.module.scss";

const suggestions = ["Which job ads have no salary?", "What changed since yesterday?", "Which warnings are urgent?"];

/**
 * A stand-in for the assistant of an app: header with the context, messages, suggestions, and composer. The answers are mocked; the
 * app's backend provides them.
 */
export function StoryAssistant({ onClose, closeKeyboardShortcut }: { onClose?: () => void; closeKeyboardShortcut?: string }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<{ id: number; text: string }>>([]);
    const send = (text: string) => {
        if (text.trim() !== "") {
            setMessages((previous) => [...previous, { id: previous.length === 0 ? 1 : previous[previous.length - 1].id + 1, text }]);
            setMessage("");
        }
    };

    return (
        <Panel
            title="AI assistant"
            description="Job ads · Austria · German"
            padding="none"
            className={styles.assistant}
            slotProps={{ body: { className: styles.assistantBody } }}
            actions={
                <>
                    <IconButton variant="text" color="secondary" aria-label="New chat" onClick={() => setMessages([])}>
                        <Icon name="chat-add" />
                    </IconButton>
                    <IconButton variant="text" color="secondary" aria-label="Close" keyboardShortcut={closeKeyboardShortcut} onClick={onClose}>
                        <Icon name="close" />
                    </IconButton>
                </>
            }
        >
            <div className={styles.messages} aria-live="polite">
                <div className={styles.message} data-from="assistant">
                    I know the content of the career portal in the scope Austria · German. What can I help you with?
                </div>
                <div className={styles.message} data-from="user">
                    Which job ads have no salary?
                </div>
                <div className={styles.message} data-from="assistant">
                    3 job ads have no salary: Senior UX Designer, QA Engineer, and Frontend developer.
                    <div className={styles.messageActions}>
                        <Button variant="outlined" color="secondary" size="small">
                            Set filter
                        </Button>
                    </div>
                </div>
                {messages.map((message) => (
                    <div key={message.id} className={styles.message} data-from="user">
                        {message.text}
                    </div>
                ))}
                {messages.length > 0 && (
                    <div className={styles.typing} role="status" aria-label="Assistant is writing">
                        <span />
                        <span />
                        <span />
                    </div>
                )}
            </div>
            <div className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                    <Button key={suggestion} variant="outlined" color="secondary" size="small" onClick={() => send(suggestion)}>
                        {suggestion}
                    </Button>
                ))}
            </div>
            <form
                className={styles.composer}
                onSubmit={(event) => {
                    event.preventDefault();
                    send(message);
                }}
            >
                <Textarea
                    name="message"
                    aria-label="Message to the AI assistant"
                    placeholder="Ask something about the career portal …"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            send(message);
                        }
                    }}
                    rows={2}
                    className={styles.composerField}
                />
                <IconButton variant="contained" color="primary" aria-label="Send" type="submit">
                    <Icon name="arrow-up" />
                </IconButton>
            </form>
            <p className={styles.note}>Answers can contain mistakes. Check them before you apply them.</p>
        </Panel>
    );
}
