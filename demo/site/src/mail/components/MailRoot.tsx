import { type Config, css, MjmlConditionalComment, MjmlMailRoot, MjmlStyle, MjmlTitle } from "@dextinity/mail-react";
import { theme } from "@src/mail/theme";
import type { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    config: Config;
    title?: string;
}>;

// Fix for Outlook, which cannot load font-face and fails to use the correct fallback-font automatically.
const outlookFontFixStyles = (
    <MjmlStyle>{css`
        div,
        span,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        a,
        b {
            font-family: Helvetica, Arial, sans-serif !important;
        }
    `}</MjmlStyle>
);

export const MailRoot: FC<Props> = ({ children, config, title }) => {
    return (
        <MjmlMailRoot
            theme={theme}
            config={config}
            head={
                <>
                    {!!title && <MjmlTitle>{title}</MjmlTitle>}
                    <MjmlConditionalComment condition="if mso">{outlookFontFixStyles}</MjmlConditionalComment>
                </>
            }
        >
            {children}
        </MjmlMailRoot>
    );
};
