import { alpha, styled } from "@mui/material/styles";

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
    border-radius: 2px;
    background-color: ${({ theme }) => alpha(theme.palette.warning.main, 0.22)};
    color: inherit;
`;
