import { Attachment, Cookie, Error, ThreeDotSaving } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";

export default {
    title: "Docs/Icons/Usage",
};

export const Icon = () => {
    return <Attachment />;
};

export const SmallSizeIcon = () => {
    return <Cookie fontSize="small" />;
};

export const DefaultSizeIcon = () => {
    return <Cookie fontSize="medium" />;
};

export const LargeSizeIcon = () => {
    return <Cookie fontSize="large" />;
};

export const CustomSizeIcon = () => {
    return <Cookie sx={{ fontSize: 100 }} />;
};

export const RenderIconInText = {
    render: () => {
        return (
            <Typography>
                This is an error <Error /> icon.
            </Typography>
        );
    },

    name: "Render Icon in Text",
};

export const DefaultColor = () => {
    return <ThreeDotSaving />;
};

export const PrimaryColor = () => {
    return <ThreeDotSaving color="primary" />;
};

export const SecondaryColor = () => {
    return <ThreeDotSaving color="secondary" />;
};

export const ErrorColor = () => {
    return <ThreeDotSaving color="error" />;
};

export const DisabledColor = () => {
    return <ThreeDotSaving color="disabled" />;
};

export const ActionColor = () => {
    return <ThreeDotSaving color="action" />;
};

export const CustomColor = () => {
    return <ThreeDotSaving htmlColor="#ff00ff" />;
};
