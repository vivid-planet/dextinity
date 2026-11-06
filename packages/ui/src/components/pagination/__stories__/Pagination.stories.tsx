import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Pagination, type PaginationProps } from "../Pagination";
import paginationTokens from "../Pagination.tokens.scss?raw";

/** Keeps the story controlled: page and page size update the local state; the args set the initial values. */
function ControlledPagination(props: PaginationProps) {
    const [page, setPage] = useState(props.page);
    const [pageSize, setPageSize] = useState(props.pageSize);
    return (
        <Pagination
            {...props}
            page={page}
            pageSize={pageSize}
            onPageChange={(nextPage) => {
                props.onPageChange(nextPage);
                setPage(nextPage);
            }}
            onPageSizeChange={
                props.onPageSizeChange &&
                ((nextPageSize) => {
                    props.onPageSizeChange?.(nextPageSize);
                    setPageSize(nextPageSize);
                    setPage(1);
                })
            }
        />
    );
}

const meta = {
    component: Pagination,
    title: "Building blocks/Tables & paging/Pagination",
    decorators: [themeDecorator],
    parameters: { tokens: paginationTokens },
    args: {
        page: 1,
        pageSize: 10,
        total: 47,
        onPageChange: fn(),
        onPageSizeChange: fn(),
    },
    argTypes: {
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
    },
    render: (args) => <ControlledPagination {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The footer of a table: "per page" picker, the visible range, and the pages.
 *
 * **Rules**
 *
 * - Remember the page size per table, e.g. in the user profile.
 * - Go back to page 1 when the page size changes.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Page 2" }));
        await waitFor(() => expect(args.onPageChange).toHaveBeenLastCalledWith(2));
        await expect(canvas.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
        await expect(canvas.getByText("11–20 of 47")).toBeVisible();

        await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
        await waitFor(() => expect(args.onPageChange).toHaveBeenLastCalledWith(3));
    },
};

/**
 * Pages far from the current one collapse into an ellipsis; the first and last page stay reachable.
 */
export const ManyPages: Story = {
    args: {
        page: 12,
        total: 480,
    },
};

/**
 * Without `onPageSizeChange`, the page size is fixed and the picker is hidden.
 */
export const FixedPageSize: Story = {
    args: {
        onPageSizeChange: undefined,
    },
};

/**
 * The picker lists `pageSizeOptions`; picking one calls `onPageSizeChange`.
 */
export const ChangePageSize: Story = {
    args: {
        page: 3,
    },
    play: async ({ args, canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Per page: 10" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(await body.findByRole("menuitemradio", { name: "25" }));
        await waitFor(() => expect(args.onPageSizeChange).toHaveBeenCalledWith(25));
        await expect(canvas.getByText("1–25 of 47")).toBeVisible();
    },
};

/**
 * Previous is disabled on the first page, next on the last.
 */
export const LastPage: Story = {
    args: {
        page: 5,
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Next page" })).toBeDisabled();
        await expect(canvas.getByRole("button", { name: "Previous page" })).toBeEnabled();
    },
};
