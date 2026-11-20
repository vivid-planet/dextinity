import { alpha, styled } from "@mui/material/styles";

interface Props {
    text: string;
    search: string;
    variant?: "underline" | "background";
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightedText({ text, search, variant = "underline" }: Props) {
    const terms = search.split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (terms.length === 0) {
        return <>{text}</>;
    }

    const pattern = new RegExp(`(${terms.join("|")})`, "gi");
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <Highlight key={`${index}:${part}`} className={variant === "background" ? "is-background" : undefined}>
                        {part}
                    </Highlight>
                ) : (
                    part
                ),
            )}
        </>
    );
}

const Highlight = styled("mark")`
    background-color: transparent;
    color: inherit;
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.palette.primary.main};
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;

    &.is-background {
        font-weight: inherit;
        text-decoration: none;
        background-color: ${({ theme }) => alpha(theme.palette.warning.main, 0.22)};
        border-radius: 2px;
    }
`;
