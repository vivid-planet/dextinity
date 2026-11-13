import { clsx } from "clsx";
import {
    type CSSProperties,
    forwardRef,
    type HTMLAttributes,
    type ReactNode,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { Spinner } from "../spinner/Spinner";
import styles from "./LogViewer.module.scss";

export type LogViewerLineTone = "error" | "warning" | "info" | "success";

/**
 * Texts of the log viewer, for translation.
 */
export interface LogViewerLabels {
    /** The accessible name of the scrollable log when there is no `title`. */
    log: string;
    /** The copy button. */
    copy: string;
    /** The copy button right after copying. */
    copied: string;
    /** The button that scrolls back to the latest lines while `follow` is on. */
    jumpToLatest: string;
    /** Shown while the log has no lines. */
    empty: string;
}

const defaultLabels: LogViewerLabels = {
    log: "Log",
    copy: "Copy log",
    copied: "Copied",
    jumpToLatest: "Jump to latest",
    empty: "No output",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type LogViewerOwnerState = {
    lineNumbers: boolean;
    wrap: boolean;
    follow: boolean;
    loading: boolean;
};

export interface LogViewerSlotProps {
    /** Props for the `header` slot, the row with the title, actions, and copy button. */
    header?: SlotPropsValue<LogViewerOwnerState, "div">;
    /** Props for the `viewport` slot, the scrollable area. */
    viewport?: SlotPropsValue<LogViewerOwnerState, "div">;
    /** Props for the `lines` slot, the list of lines. */
    lines?: SlotPropsValue<LogViewerOwnerState, "ol">;
}

export interface LogViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "title" | "content" | "onCopy"> {
    /** The log text. Lines are separated by line breaks. */
    content: string;
    /** A heading above the log, e.g. the job's name. Also the log's accessible name. */
    title?: ReactNode;
    /** More actions in the header, before the copy button, e.g. a download button. */
    actions?: ReactNode;
    /**
     * Numbers the lines. The numbers aren't copied along with the text.
     *
     * @defaultValue `true`
     */
    lineNumbers?: boolean;
    /**
     * Wraps long lines instead of scrolling sideways.
     *
     * @defaultValue `false`
     */
    wrap?: boolean;
    /**
     * Keeps the latest lines in view as the log grows, e.g. while a job runs. Scrolling up pauses it; a button jumps back.
     *
     * @defaultValue `false`
     */
    follow?: boolean;
    /**
     * Shows a spinner below the last line, e.g. while more output is expected.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /** Highlights a line, e.g. `error` for lines that contain "ERROR". */
    getLineTone?: (line: string, index: number) => LogViewerLineTone | undefined;
    /** Called after the log was copied to the clipboard. */
    onCopy?: (content: string) => void;
    /** The built-in texts. */
    labels?: Partial<LogViewerLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: LogViewerSlotProps;
}

const copiedDuration = 1600;
// How close to the end, in pixels, still counts as at the end, so a fraction of a line doesn't pause following
const endThreshold = 8;

function splitLines(content: string) {
    if (content === "") {
        return [];
    }
    const lines = content.split(/\r?\n/);
    return lines[lines.length - 1] === "" ? lines.slice(0, -1) : lines;
}

function isAtEnd(element: HTMLElement) {
    return element.scrollHeight - element.scrollTop - element.clientHeight <= endThreshold;
}

/**
 * The output of a job or process in mono, with line numbers and a copy button. While following, it keeps the latest lines in view.
 */
export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>(function LogViewer(
    {
        content,
        title,
        actions,
        lineNumbers = true,
        wrap = false,
        follow = false,
        loading = false,
        getLineTone,
        onCopy,
        labels: labelsProp,
        className,
        slotProps,
        style,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: LogViewerOwnerState = { lineNumbers, wrap, follow, loading };
    const lines = useMemo(() => splitLines(content), [content]);
    const viewportRef = useRef<HTMLDivElement>(null);
    const stuckToEnd = useRef(true);
    const [atEnd, setAtEnd] = useState(true);
    const [copied, setCopied] = useState(false);
    const titleId = `${useId()}title`;

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (viewport != null && follow && stuckToEnd.current) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [content, follow, loading]);

    useEffect(() => {
        if (!copied) {
            return;
        }
        const timeout = window.setTimeout(() => setCopied(false), copiedDuration);
        return () => window.clearTimeout(timeout);
    }, [copied]);

    async function copy() {
        try {
            await navigator.clipboard.writeText(content);
        } catch {
            return;
        }
        setCopied(true);
        onCopy?.(content);
    }

    const jumpToLatest = () => {
        const viewport = viewportRef.current;
        if (viewport != null) {
            stuckToEnd.current = true;
            setAtEnd(true);
            viewport.scrollTop = viewport.scrollHeight;
        }
    };

    const headerProps = resolveSlotProps<LogViewerOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const viewportProps = resolveSlotProps<LogViewerOwnerState, "div", "div">({
        ownProps: {
            ref: viewportRef,
            className: styles.viewport,
            role: "log",
            "aria-live": "off",
            "aria-label": title == null ? labels.log : undefined,
            "aria-labelledby": title != null ? titleId : undefined,
            "aria-busy": loading || undefined,
            tabIndex: 0,
            onScroll: (event) => {
                const end = isAtEnd(event.currentTarget);
                stuckToEnd.current = end;
                setAtEnd(end);
            },
        },
        slotProps: slotProps?.viewport,
        ownerState,
    });
    const linesProps = resolveSlotProps<LogViewerOwnerState, "ol", "ol">({
        ownProps: { className: styles.lines },
        slotProps: slotProps?.lines,
        ownerState,
    });

    const numberWidth = `${String(Math.max(lines.length, 1)).length}ch`;

    return (
        <div
            {...restProps}
            ref={ref}
            style={{ ...style, "--dextinity-log-viewer-number-width": numberWidth } as CSSProperties}
            data-linenumbers={ownerState.lineNumbers ? "" : undefined}
            data-wrap={ownerState.wrap ? "" : undefined}
            data-follow={ownerState.follow ? "" : undefined}
            data-loading={ownerState.loading ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headerProps}>
                {title != null && (
                    <span id={titleId} className={styles.title}>
                        {title}
                    </span>
                )}
                <span className={styles.actions}>
                    {actions}
                    <IconButton
                        variant="text"
                        color="secondary"
                        size="small"
                        aria-label={copied ? labels.copied : labels.copy}
                        disabled={lines.length === 0}
                        onClick={() => void copy()}
                    >
                        <Icon name={copied ? "check" : "copy"} />
                    </IconButton>
                </span>
                <span className={styles.status} role="status">
                    {copied ? labels.copied : null}
                </span>
            </div>
            <div {...viewportProps}>
                {lines.length === 0 && !loading ? (
                    <p className={styles.empty}>{labels.empty}</p>
                ) : (
                    <ol {...linesProps}>
                        {lines.map((line, index) => (
                            <li key={index} className={styles.line} data-tone={getLineTone?.(line, index)}>
                                {lineNumbers && (
                                    <span className={styles.number} aria-hidden="true">
                                        {index + 1}
                                    </span>
                                )}
                                <span className={styles.text}>{line === "" ? "​" : line}</span>
                            </li>
                        ))}
                    </ol>
                )}
                {loading && <Spinner className={styles.spinner} />}
            </div>
            {follow && !atEnd && (
                <Button size="small" variant="outlined" className={styles.jump} startIcon={<Icon name="arrow-down" />} onClick={jumpToLatest}>
                    {labels.jumpToLatest}
                </Button>
            )}
        </div>
    );
});
