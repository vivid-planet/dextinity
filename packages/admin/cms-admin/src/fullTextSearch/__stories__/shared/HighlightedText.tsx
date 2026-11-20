import { styled } from "@mui/material/styles";

interface Props {
    text: string;
    search: string;
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightedText({ text, search }: Props) {
    const terms = search.split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (terms.length === 0) {
        return <>{text}</>;
    }

    const pattern = new RegExp(`(${terms.join("|")})`, "gi");
    const parts = text.split(pattern);

    return <>{parts.map((part, index) => (index % 2 === 1 ? <Highlight key={`${index}:${part}`}>{part}</Highlight> : part))}</>;
}

const Highlight = styled("mark")`
    background-color: transparent;
    color: inherit;
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.palette.primary.main};
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;
`;
