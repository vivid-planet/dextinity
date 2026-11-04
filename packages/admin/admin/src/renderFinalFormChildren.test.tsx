import type { ReactElement } from "react";
import type { FormRenderProps } from "react-final-form";
import { render, screen } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { renderFinalFormChildren } from "./renderFinalFormChildren";

const minimalFormRenderProps = {
    handleSubmit: vi.fn(),
    form: {} as any,
    submitting: false,
    pristine: true,
    values: {},
} as unknown as FormRenderProps<Record<string, unknown>>;

describe("renderFinalFormChildren", () => {
    it("should render a component when the component prop is provided", () => {
        const MyComponent = () => <div>component output</div>;
        render(renderFinalFormChildren({ component: MyComponent }, minimalFormRenderProps) as ReactElement);
        expect(screen.getByText("component output")).toBeDefined();
    });

    it("should call the render prop with formRenderProps when render is provided", () => {
        const render = vi.fn(() => <div>rendered</div>);
        renderFinalFormChildren({ render }, minimalFormRenderProps);
        expect(render).toHaveBeenCalledWith(minimalFormRenderProps);
    });

    it("should call children as a function with formRenderProps when children is a function", () => {
        const children = vi.fn(() => <div>child output</div>);
        renderFinalFormChildren({ children }, minimalFormRenderProps);
        expect(children).toHaveBeenCalledWith(minimalFormRenderProps);
    });

    it("should return children directly when children is a ReactNode (not a function)", () => {
        const node = <span>static child</span>;
        const result = renderFinalFormChildren({ children: node }, minimalFormRenderProps);
        expect(result).toBe(node);
    });

    it("should inject children into formRenderProps when both render and children are provided", () => {
        const children = <span>injected</span>;
        const render = vi.fn(() => null);
        renderFinalFormChildren({ render, children }, minimalFormRenderProps);
        expect(render).toHaveBeenCalledWith({ ...minimalFormRenderProps, children });
    });

    it("should return undefined when no component, render, or children is provided", () => {
        const result = renderFinalFormChildren({}, minimalFormRenderProps);
        expect(result).toBeUndefined();
    });
});
