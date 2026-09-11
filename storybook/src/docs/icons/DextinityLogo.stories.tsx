import { DextinityIcon, DextinityLogo } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";

export default {
    title: "Docs/Icons/Logo",
};

const LightBackground = styled("div")`
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background-color: #ffffff;
`;

const DarkBackground = styled("div")`
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background-color: #141517;
`;

export const Dark = () => (
    <LightBackground>
        <DextinityLogo sx={{ fontSize: 50 }} />
    </LightBackground>
);

export const Light = () => (
    <DarkBackground>
        <DextinityLogo variant="light" sx={{ fontSize: 50 }} />
    </DarkBackground>
);

/** The monochrome variant inherits `currentColor`, so `htmlColor` (or CSS `color`) produces the black/grey/white assets. */
export const Monochrome = () => (
    <>
        <LightBackground>
            <DextinityLogo variant="monochrome" htmlColor="black" sx={{ fontSize: 50 }} />
            <DextinityLogo variant="monochrome" htmlColor="#27292E" sx={{ fontSize: 50 }} />
        </LightBackground>
        <DarkBackground>
            <DextinityLogo variant="monochrome" htmlColor="white" sx={{ fontSize: 50 }} />
        </DarkBackground>
    </>
);

export const Icon = () => (
    <LightBackground>
        <DextinityIcon sx={{ fontSize: 100 }} />
        <DextinityIcon variant="dark" sx={{ fontSize: 100 }} />
        <DextinityIcon variant="masked" sx={{ fontSize: 100 }} />
    </LightBackground>
);

/**
 * SVG gradient ids are document-global, so each instance generates its own. If that ever regresses, the second
 * instance of each pair loses its gradient.
 */
export const MultipleInstances = () => (
    <LightBackground>
        <DextinityLogo sx={{ fontSize: 30 }} />
        <DextinityLogo sx={{ fontSize: 30 }} />
        <DextinityIcon sx={{ fontSize: 60 }} />
        <DextinityIcon sx={{ fontSize: 60 }} />
    </LightBackground>
);
