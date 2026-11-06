import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import { Banner } from "../../../components/banner/Banner";
import { Button } from "../../../components/button/Button";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { Icon } from "../../../components/icon/Icon";
import { Input } from "../../../components/input/Input";
import { Skeleton } from "../../../components/skeleton/Skeleton";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { Toast } from "../../../components/toast/Toast";
import { jobAds } from "../../../storybook/patterns/jobAds";
import {
    PatternExample,
    patternListClassNames,
    PatternPage,
    PatternRules,
    PatternSection,
    PatternSpec,
    PatternSpecs,
    PatternUses,
} from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./EmptyLoadingError.stories.module.scss";

const loadingDelay = 1500;
const skeletonThreshold = 300;

/** Loads for 1.5 s; the skeleton appears only after 300 ms, so quick loads don't flicker. */
function LoadingExample() {
    const [loading, setLoading] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
        if (!loading) {
            return;
        }
        const skeletonTimeout = window.setTimeout(() => setShowSkeleton(true), skeletonThreshold);
        const doneTimeout = window.setTimeout(() => {
            setLoading(false);
            setShowSkeleton(false);
        }, loadingDelay);
        return () => {
            window.clearTimeout(skeletonTimeout);
            window.clearTimeout(doneTimeout);
        };
    }, [loading]);

    return (
        <div className={styles.loading}>
            <Button variant="outlined" size="small" startIcon={<Icon name="refresh" />} loading={loading} onClick={() => setLoading(true)}>
                Reload
            </Button>
            <div className={styles.rows} aria-busy={loading} aria-label="Job ads" role="region">
                {showSkeleton ? (
                    <Skeleton variant="row" count={3} />
                ) : (
                    <ul className={patternListClassNames.list}>
                        {jobAds.slice(0, 3).map((jobAd) => (
                            <li key={jobAd.id} className={patternListClassNames.row}>
                                <span className={patternListClassNames.rowTitle}>{jobAd.title}</span>
                                <StatusIndicator status={jobAd.status} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function TitleFieldExample() {
    const [title, setTitle] = useState("");
    return (
        <div className={styles.field}>
            <Input
                label="Title"
                name="title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                state={title === "" ? "error" : "default"}
                validationMessage="Enter a title."
            />
        </div>
    );
}

function EmptyLoadingErrorPage() {
    return (
        <PatternPage>
            <PatternSection title="Empty" description="Three reasons, three texts.">
                <PatternSpecs>
                    <PatternSpec label="First use">
                        <EmptyState
                            icon={<Icon name="page" />}
                            title="No redirects yet"
                            description="Redirects are created automatically when a path changes."
                            actions={
                                <Button variant="outlined" size="small">
                                    New redirect
                                </Button>
                            }
                        />
                    </PatternSpec>
                    <PatternSpec label="No matches">
                        <EmptyState
                            icon={<Icon name="search" />}
                            title="No matches for “Marketing”"
                            description="Check the spelling or reset the filters."
                            actions={
                                <Button variant="outlined" size="small">
                                    Reset filters
                                </Button>
                            }
                        />
                    </PatternSpec>
                    <PatternSpec label="Empty folder">
                        <EmptyState
                            icon={<Icon name="folder" />}
                            title="This folder is empty"
                            description="Drag files here or upload them."
                            actions={
                                <Button variant="outlined" size="small" startIcon={<Icon name="upload" />}>
                                    Upload
                                </Button>
                            }
                        />
                    </PatternSpec>
                </PatternSpecs>
            </PatternSection>
            <PatternSection title="Loading" description="Skeleton for lists and cards, spinner in the button or field. Nothing under 300 ms.">
                <PatternExample>
                    <LoadingExample />
                </PatternExample>
            </PatternSection>
            <PatternSection title="Error">
                <PatternSpecs>
                    <PatternSpec label="Field" caption="At the field; saving jumps there">
                        <TitleFieldExample />
                    </PatternSpec>
                    <PatternSpec label="Action" caption="Toast, with the reason">
                        <Toast tone="error" message="“logo.svg” is still in use · nothing deleted" />
                    </PatternSpec>
                    <PatternSpec label="Connection" caption="Banner above the content">
                        <Banner
                            action={
                                <Button variant="outlined" size="small">
                                    Try again
                                </Button>
                            }
                        >
                            No connection. Changes stay here until they are saved.
                        </Banner>
                    </PatternSpec>
                </PatternSpecs>
            </PatternSection>
            <PatternUses pages={["Menus & messages", "Loading & save state", "Form fields"]} />
            <PatternRules
                dos={["Every empty state has a way forward.", "Errors say what is missing and how to fix it."]}
                donts={["Empty tables with a header row.", "Technical error codes as the only information."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Empty, loading & error",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "What to show when there is nothing, nothing yet, or something wrong. `EmptyState` for empty lists, `Skeleton` and `Spinner` while loading, field messages, error toasts and a `Banner` for errors.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: give every empty state a way forward; say in errors what is missing and how to fix it.
 * - Don't: show empty tables with a header row; show technical error codes as the only information.
 */
export const Default: Story = {
    render: () => <EmptyLoadingErrorPage />,
};

/**
 * Reloading shows the spinner in the button at once and the skeleton only after 300 ms; the content returns when loading ends.
 */
export const Loading: Story = {
    render: () => <EmptyLoadingErrorPage />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Reload" }));
        const region = canvas.getByRole("region", { name: "Job ads" });
        await expect(region).toHaveAttribute("aria-busy", "true");
        await waitFor(() => expect(region.querySelector("ul")).toBeNull());
        await waitFor(() => expect(region).toHaveAttribute("aria-busy", "false"), { timeout: 3000 });
        await expect(canvas.getByText("Senior UX Designer")).toBeVisible();
    },
};

/**
 * A field error says what is missing, and disappears once it is fixed.
 */
export const FieldError: Story = {
    render: () => <EmptyLoadingErrorPage />,
    play: async ({ canvas }) => {
        const title = canvas.getByRole("textbox", { name: "Title" });
        await expect(title).toHaveAccessibleDescription("Enter a title.");
        await userEvent.type(title, "Careers");
        await expect(title).not.toHaveAttribute("aria-invalid");
    },
};
