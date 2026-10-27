import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import type { PropsWithChildren } from "react";

export const TableLayout = ({ children }: PropsWithChildren) => (
    <PageLayout>
        <AnimateBoxInOnScroll direction="bottom" offset={300}>
            {children}
        </AnimateBoxInOnScroll>
    </PageLayout>
);
