import { Stack, useStackApi } from "@dextinity/admin";
import { Breadcrumbs } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { createContext, type PropsWithChildren, type ReactNode, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router";

import { stickyTopVariable } from "./stickyTopVariable";

export type BlockAdminComponentRootContentKind = "page" | "email";

interface Props {
    title?: ReactNode;
    /** What the blocks make up. The Add Block Drawer names it on the top level, e.g. "Will be inserted at the end of the page.", instead of the `title`. */
    contentKind?: BlockAdminComponentRootContentKind;
}

const ContentKindContext = createContext<BlockAdminComponentRootContentKind | undefined>(undefined);

export function useBlockAdminComponentRootContentKind() {
    return useContext(ContentKindContext);
}

const BlockAdminComponentRoot = (props: PropsWithChildren<Props>) => {
    const { children, title = <FormattedMessage id="dextinity.blocks" defaultMessage="Blocks" />, contentKind } = props;

    return (
        <ContentKindContext.Provider value={contentKind}>
            <Stack topLevelTitle={title}>
                <BlockAdminComponentRootContent>{children}</BlockAdminComponentRootContent>
            </Stack>
        </ContentKindContext.Provider>
    );
};

export { BlockAdminComponentRoot };

function BlockAdminComponentRootContent({ children }: PropsWithChildren) {
    const intl = useIntl();
    const history = useHistory();
    const stackApi = useStackApi();
    const breadcrumbItems = useMemo(() => stackApi?.breadCrumbs ?? [], [stackApi]);
    const titlesRef = useRef<HTMLSpanElement>(null);
    const [titleTexts, setTitleTexts] = useState<string[]>([]);
    const isNested = breadcrumbItems.length > 1;

    // The breadcrumbs of the ui take text, while stack titles may be any node, e.g. a `FormattedMessage`
    useLayoutEffect(() => {
        const renderedTexts = Array.from(titlesRef.current?.children ?? [], (titleElement) => titleElement.textContent ?? "");
        setTitleTexts((previousTexts) =>
            previousTexts.length === renderedTexts.length && previousTexts.every((text, index) => text === renderedTexts[index])
                ? previousTexts
                : renderedTexts,
        );
    }, [breadcrumbItems]);

    return (
        <Root data-nested={isNested ? "" : undefined}>
            <span ref={titlesRef} hidden>
                {breadcrumbItems.map((item) => (
                    <span key={item.id}>{item.title}</span>
                ))}
            </span>
            {isNested && (
                <BreadcrumbsBar>
                    <Breadcrumbs
                        items={breadcrumbItems.map((item, index) => ({
                            label: titleTexts[index] ?? "",
                            href: history.createHref({ pathname: item.url }),
                            onClick: () => history.push(item.url),
                        }))}
                        labels={{
                            breadcrumbs: intl.formatMessage({ id: "dextinity.blocks.breadcrumbs", defaultMessage: "Nested blocks" }),
                            showCollapsed: intl.formatMessage({
                                id: "dextinity.blocks.breadcrumbs.showCollapsed",
                                defaultMessage: "Show hidden levels",
                            }),
                        }}
                    />
                </BreadcrumbsBar>
            )}
            {children}
        </Root>
    );
}

const breadcrumbsBarHeight = "44px";

const Root = styled("div")`
    ${stickyTopVariable}: 0px;

    &[data-nested] {
        ${stickyTopVariable}: ${breadcrumbsBarHeight};
    }
`;

const BreadcrumbsBar = styled("div")`
    position: sticky;
    inset-block-start: 0;
    z-index: 16;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    block-size: ${breadcrumbsBarHeight};
    margin-block-end: var(--dextinity-space-3);
    padding-inline: var(--dextinity-space-3);
    border-radius: var(--dextinity-radius-field);
    background: var(--dextinity-panel-glass-background);
    box-shadow: var(--dextinity-panel-glass-shadow);
    backdrop-filter: blur(var(--dextinity-panel-glass-blur)) saturate(1.6);
`;
