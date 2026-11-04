import { type Config, MjmlMailRoot, MjmlTitle } from "@dextinity/mail-react";
import { theme } from "@src/mail/theme";
import type { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    config: Config;
    title?: string;
}>;

export const MailRoot: FC<Props> = ({ children, config, title }) => {
    return (
        <MjmlMailRoot theme={theme} config={config} head={!!title && <MjmlTitle>{title}</MjmlTitle>}>
            {children}
        </MjmlMailRoot>
    );
};
