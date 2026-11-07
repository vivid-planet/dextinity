import { type PropsWithChildren, type ReactNode, useId } from "react";

import { Description, Fields, Head, Section, Title } from "./FormSection.sc";

interface FormSectionProps {
    title: string;
    description?: ReactNode;
    /** Puts the fields side by side where there is room. */
    columns?: boolean;
}

export function FormSection({ title, description, columns, children }: PropsWithChildren<FormSectionProps>) {
    const titleId = useId();
    return (
        <Section aria-labelledby={titleId}>
            <Head>
                <Title id={titleId}>{title}</Title>
                {description ? <Description>{description}</Description> : null}
            </Head>
            {columns ? <Fields>{children}</Fields> : children}
        </Section>
    );
}
