/** Matches the sidebar's width in `ReviewSidebar.module.scss`. */
const reviewSidebarWidth = 360;
/** The width below which the frame is too narrow to review a page in, e.g. to see a note's element next to its note. */
const minCanvasWidth = 480;

/**
 * Where the review sidebar and the prototypes panel go so that the canvas keeps at least `minCanvasWidth`: the sidebar stays next
 * to the canvas while that leaves enough room, and covers it otherwise. Next to the sidebar, the prototypes panel covers the
 * canvas, too, once both together would leave too little room, since the notes are what the reviewer works with.
 */
export function getReviewSidebarLayout({ bodyWidth, panelWidth }: { bodyWidth: number; panelWidth: number }) {
    const sidebarOverlay = bodyWidth - reviewSidebarWidth < minCanvasWidth;
    return {
        sidebarOverlay,
        panelOverlay: !sidebarOverlay && bodyWidth - panelWidth - reviewSidebarWidth < minCanvasWidth,
    };
}
