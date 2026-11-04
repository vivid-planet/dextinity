import { createElement, type ReactNode } from "react";
import type { FormRenderProps, RenderableProps } from "react-final-form";

// Render children like final-form does.
export function renderFinalFormChildren<FormValues = Record<string, any>, InitialFormValues = Partial<FormValues>>(
    props: RenderableProps<FormRenderProps<FormValues, InitialFormValues>>,
    formRenderProps: FormRenderProps<FormValues, InitialFormValues>,
) {
    const { render, children, component } = props; // not using this.props as final-form-render-component does also use function-parameters and this solves "multiple implementations" hint
    if (component) {
        return createElement(
            component,
            // Explicit cast to remove InitialFormValues because FormRenderProps doesn't pass InitialFormValues to RenderableProps here:
            // https://github.com/final-form/react-final-form/blob/main/typescript/index.d.ts#L56-L67.
            // See https://github.com/final-form/react-final-form/pull/998.
            { ...formRenderProps, render: render as ((props: FormRenderProps<FormValues>) => ReactNode) | undefined },
            children as ReactNode,
        );
    }
    if (render) {
        return render(children === undefined ? formRenderProps : ({ ...formRenderProps, children } as any)); // inject children back in
    }
    if (typeof children !== "function") {
        return children;
    }
    return children(formRenderProps);
}
