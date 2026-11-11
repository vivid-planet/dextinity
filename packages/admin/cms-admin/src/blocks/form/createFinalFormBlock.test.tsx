import { Field, Form, FormSpy } from "react-final-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen } from "../../testing/test-utils";
import { composeBlocks } from "../helpers/composeBlocks/composeBlocks";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { createCompositeBlockTextField } from "../helpers/createCompositeBlockTextField";
import type { BlockInterface } from "../types";
import { createFinalFormBlock } from "./createFinalFormBlock";

const { api: composedApi, block: composedBlock } = composeBlocks({
    first: createCompositeBlockTextField({ label: "First", placeholder: "First" }),
    second: createCompositeBlockTextField({ label: "Second", placeholder: "Second" }),
});

const TwoFormsBlock: BlockInterface = {
    ...createBlockSkeleton(),
    ...composedBlock,
    name: "TwoForms",
    displayName: "Two forms",
    AdminComponent: ({ state, updateState }) => {
        const { first, second } = composedApi.adminComponents({ state, updateState });
        return (
            <>
                {first}
                {second}
            </>
        );
    },
};

const FinalFormTwoFormsBlock = createFinalFormBlock(TwoFormsBlock);

describe("createFinalFormBlock", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("keeps the changes of two child forms that autosave before the next render", () => {
        let formValues: Record<string, unknown> = {};

        render(
            <Form onSubmit={() => {}} initialValues={{ content: { first: "", second: "" } }}>
                {() => (
                    <>
                        <Field name="content" component={FinalFormTwoFormsBlock} />
                        <FormSpy subscription={{ values: true }}>
                            {({ values }) => {
                                formValues = values;
                                return null;
                            }}
                        </FormSpy>
                    </>
                )}
            </Form>,
        );

        act(() => {
            fireEvent.change(screen.getByPlaceholderText("First"), { target: { value: "first value" } });
            fireEvent.change(screen.getByPlaceholderText("Second"), { target: { value: "second value" } });
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(formValues.content).toEqual({ first: "first value", second: "second value" });
    });
});
