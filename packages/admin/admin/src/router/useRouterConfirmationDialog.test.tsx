import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import { cleanup, fireEvent, render, waitFor } from "test-utils";
import { afterEach, expect, test, vi } from "vitest";

import { RouterPrompt } from "./Prompt";
import { useRouterConfirmationDialog } from "./useRouterConfirmationDialog";

afterEach(cleanup);

function CustomConfirmationDialog() {
    const dialog = useRouterConfirmationDialog();

    if (!dialog.open) {
        return null;
    }

    return (
        <div role="alertdialog">
            {dialog.message}
            {dialog.showSaveButton && <button onClick={() => void dialog.onSave()}>save</button>}
            <button onClick={() => void dialog.onDiscard()}>discard</button>
            <button onClick={() => void dialog.onCancel()}>stay</button>
        </div>
    );
}

function Story({ saveAction }: { saveAction?: () => boolean }) {
    return (
        <>
            <CustomConfirmationDialog />
            <Switch>
                <Route path="/other">
                    <div>other page</div>
                </Route>
                <Route>
                    <RouterPrompt message={() => "Unsaved changes"} saveAction={saveAction}>
                        <Link to="/other">leave</Link>
                    </RouterPrompt>
                </Route>
            </Switch>
        </>
    );
}

test("Shows the prompt in the custom dialog instead of the built-in one", async () => {
    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("leave"));

    await waitFor(() => expect(rendered.getByRole("alertdialog").textContent).toContain("Unsaved changes"));
    expect(rendered.queryByText("save")).toBeNull();
    expect(rendered.queryByRole("dialog")).toBeNull();
});

test("Stays on the page when cancelled and leaves when discarded", async () => {
    const rendered = render(<Story />);

    fireEvent.click(rendered.getByText("leave"));
    fireEvent.click(await rendered.findByText("stay"));
    await waitFor(() => expect(rendered.queryByRole("alertdialog")).toBeNull());
    expect(rendered.queryByText("other page")).toBeNull();

    fireEvent.click(rendered.getByText("leave"));
    fireEvent.click(await rendered.findByText("discard"));
    await rendered.findByText("other page");
});

test("Saves before leaving", async () => {
    const saveAction = vi.fn(() => true);
    const rendered = render(<Story saveAction={saveAction} />);

    fireEvent.click(rendered.getByText("leave"));
    fireEvent.click(await rendered.findByText("save"));

    await rendered.findByText("other page");
    expect(saveAction).toHaveBeenCalledOnce();
});
