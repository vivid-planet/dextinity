import { Close, DextinityLogo } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogContent as MuiDialogContent,
    DialogTitle,
    IconButton,
    Link,
    Modal as MuiModal,
    Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { styled } from "@mui/material/styles";
import type { ReactElement } from "react";
import { FormattedDate, FormattedMessage } from "react-intl";

import { version } from "../../..";
import { useBuildInformation } from "./build-information/useBuildInformation";

interface AboutModalProps {
    onClose?: () => void;
    open: boolean;
    logo?: ReactElement;
}

export function AboutModal({ open, onClose, logo = <DextinityLogo sx={{ fontSize: 68 }} /> }: AboutModalProps) {
    const buildInformation = useBuildInformation();

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop}>
            <Dialog open onClose={onClose}>
                <DialogTitle>
                    <DialogTitleContent>
                        <Typography>
                            <FormattedMessage id="dextinity.about.dialog.title" defaultMessage="About" />
                        </Typography>
                        <DialogTitleSpace />
                        <IconButton onClick={onClose} color="inherit" size="large">
                            <Close />
                        </IconButton>
                    </DialogTitleContent>
                </DialogTitle>
                <DialogContent>
                    <LogoContainer>{logo}</LogoContainer>
                    <VersionContainer>
                        <Typography fontWeight={500}>{`v${version}`}</Typography>
                        {buildInformation?.number && buildInformation.commitHash && (
                            <Typography>
                                <FormattedMessage
                                    id="dextinity.version.title"
                                    defaultMessage="{buildNumber} ({commitSha})"
                                    values={{
                                        buildNumber: buildInformation.number,
                                        commitSha: buildInformation.commitHash,
                                    }}
                                />
                            </Typography>
                        )}
                        {buildInformation?.date && (
                            <Typography>
                                <FormattedDate value={buildInformation.date} dateStyle="medium" timeStyle="short" />
                            </Typography>
                        )}
                    </VersionContainer>
                    <Typography>
                        <FormattedMessage id="dextinity.about.dialog.copyright" defaultMessage="Copyright © Vivid Planet Software GmbH" />
                    </Typography>

                    <Link href="https://www.vivid-planet.com" target="_blank" underline="hover">
                        {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message,react/jsx-no-literals */}
                        <Typography>www.vivid-planet.com</Typography>
                    </Link>
                </DialogContent>
            </Dialog>
        </Modal>
    );
}

const Modal = styled(MuiModal)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const DialogTitleContent = styled("div")`
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
`;

const DialogTitleSpace = styled("div")`
    display: flex;
    flex: 1;
`;

const DialogContent = styled(MuiDialogContent)`
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    flex-direction: column;
`;

const VersionContainer = styled("div")`
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 40px;
    margin-bottom: 40px;
`;

const LogoContainer = styled("div")`
    align-items: center;

    svg {
        max-width: 100%;
        height: auto;
    }
`;
