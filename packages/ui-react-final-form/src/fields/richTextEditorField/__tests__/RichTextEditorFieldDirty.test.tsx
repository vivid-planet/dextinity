import { act, render, screen } from "@testing-library/react";
import type { FormApi } from "final-form";
import { Form, FormSpy } from "react-final-form";
import { describe, expect, it } from "vitest";

import { RichTextEditorField } from "../RichTextEditorField";

describe("RichTextEditorField dirty check", () => {
    it("treats markup without visible text as unchanged, also when isEqual is passed through as undefined", () => {
        let formApi: FormApi | undefined;
        render(
            <Form onSubmit={() => undefined} initialValues={{ text: "" }}>
                {({ form }) => {
                    formApi = form;
                    return (
                        <>
                            <RichTextEditorField name="text" label="Text" isEqual={undefined} />
                            <FormSpy subscription={{ dirty: true }}>{({ dirty }) => <output>{dirty ? "dirty" : "pristine"}</output>}</FormSpy>
                        </>
                    );
                }}
            </Form>,
        );

        act(() => formApi?.change("text", "<p>Hello</p>"));
        expect(screen.getByRole("status")).toHaveTextContent("dirty");

        act(() => formApi?.change("text", "<p></p>"));
        expect(screen.getByRole("status")).toHaveTextContent("pristine");
    });
});
