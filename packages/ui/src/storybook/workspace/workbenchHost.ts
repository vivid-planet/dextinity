/**
 * Whether the host can send a comment to Claude: `available` when it can; `writers_only` when the viewer isn't an editor of the
 * artifact; `no_session` when no Claude session can receive it right now; `off` when this view doesn't offer it. The Workbench treats
 * any other value as unavailable.
 */
export type ClaudeAvailability = "available" | "writers_only" | "no_session" | "off";

interface WorkbenchComment {
    /** The whole comment, readable without the Workbench; at most 4 KiB of UTF-8. */
    text: string;
    /** A short title, e.g. `Note · Job ads`; at most 128 bytes of UTF-8. */
    label: string;
}

/**
 * Comments on the page that hosts the Workbench. The page may provide it as `window.dextinityWorkbenchHost.comments`, on itself or on
 * any same-origin window above the Workbench's frame, e.g. the launcher of the published artifact. Without it, or when its `isAvailable`
 * resolves `false`, the Workbench copies the formatted comment to the clipboard instead.
 *
 * A host page in a claude.ai Artifact declares the `comments` capability (`{comments: {}}`) and implements it with
 * `claude.use("comments")`, anchored to the frame that shows the Workbench. The Workbench calls `post` and `sendToClaude` only from a
 * click of the viewer, as the capability requires:
 *
 * ```ts
 * const comments = await claude.use("comments"); // null: leave `dextinityWorkbenchHost` out, or resolve `isAvailable` to `false`
 * const frame = document.querySelector("iframe");
 * window.dextinityWorkbenchHost = {
 *     comments: {
 *         isAvailable: async () => true,
 *         canSendToClaude: () => comments.canSendToClaude(),
 *         post: async ({ text }) => {
 *             await comments.create({ anchor: await comments.anchorFor(frame), text });
 *         },
 *         sendToClaude: async ({ text }) => {
 *             await comments.sendToClaude({ anchor: await comments.anchorFor(frame), text });
 *         },
 *     },
 * };
 * ```
 *
 * Each method rejects with an `Error` whose message the Workbench shows; the Workbench never retries on its own.
 */
export interface WorkbenchCommentsHost {
    /** Asked each time the notes sidebar opens; `false`, e.g. when the page's comments couldn't load, makes the Workbench copy instead. */
    isAvailable(): Promise<boolean>;
    /** Asked each time the notes sidebar opens; only `available` enables “Send to Claude”. */
    canSendToClaude(): Promise<ClaudeAvailability>;
    /** Posts the comment on the artifact, where everyone who opens it sees it. */
    post(comment: WorkbenchComment): Promise<void>;
    /** Posts the comment and also sends it to Claude's session. */
    sendToClaude(comment: WorkbenchComment): Promise<void>;
}

interface WorkbenchHostWindow {
    dextinityWorkbenchHost?: { comments?: WorkbenchCommentsHost };
}

/**
 * Finds the comments host on this window or one above it. A window of another origin, e.g. claude.ai around the artifact, throws on
 * access, and the search goes on above it.
 */
export function findWorkbenchCommentsHost(): WorkbenchCommentsHost | null {
    let current: Window = window;
    for (;;) {
        try {
            const host = (current as Window & WorkbenchHostWindow).dextinityWorkbenchHost?.comments;
            if (host) {
                return host;
            }
        } catch {
            // Another origin
        }
        if (current === current.parent) {
            return null;
        }
        current = current.parent;
    }
}
