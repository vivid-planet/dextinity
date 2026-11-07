import { useCurrentDamFolder, useDamAcceptedMimeTypes, useDamFileUpload } from "@dextinity/cms-admin";
import { Button, Dialog, EmptyState, Icon, Spinner } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useIntl } from "react-intl";

import { getRandomPicsumImage, type PicsumImage } from "./getRandomPicsumImage";

export const ImportFromPicsum = () => {
    const intl = useIntl();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { folderId } = useCurrentDamFolder();
    const [isOpen, setIsOpen] = useState(false);
    const [picsumImage, setPicsumImage] = useState<PicsumImage>();
    const [isImporting, setIsImporting] = useState(false);
    const [hasLoadingFailed, setHasLoadingFailed] = useState(false);

    const { uploadFiles, dialogs: uploadDialogs } = useDamFileUpload({
        acceptedMimetypes: allAcceptedMimeTypes,
    });

    const shuffle = async () => {
        setPicsumImage(undefined);
        setHasLoadingFailed(false);
        try {
            setPicsumImage(await getRandomPicsumImage());
        } catch {
            setHasLoadingFailed(true);
        }
    };

    const openDialog = () => {
        setIsOpen(true);
        shuffle();
    };

    const closeDialog = () => {
        setIsOpen(false);
        setPicsumImage(undefined);
    };

    const importImage = async () => {
        if (picsumImage === undefined) {
            return;
        }
        setIsImporting(true);
        try {
            await uploadFiles({ acceptedFiles: [picsumImage.file], fileRejections: [] }, { folderId });
        } finally {
            setIsImporting(false);
        }
        closeDialog();
    };

    const title = intl.formatMessage({ id: "pages.dam.importFromPicsum", defaultMessage: "Import from Picsum" });

    return (
        <>
            <Button variant="text" color="secondary" startIcon={<Icon name="image" />} onClick={openDialog}>
                {title}
            </Button>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                title={title}
                description={intl.formatMessage({
                    id: "pages.dam.importFromPicsum.dialog.description",
                    defaultMessage: "A random photo from Lorem Picsum, imported into the current folder.",
                })}
                labels={{ close: intl.formatMessage({ id: "pages.dam.importFromPicsum.dialog.close", defaultMessage: "Close" }) }}
                footer={
                    <>
                        <Button variant="outlined" color="secondary" onClick={closeDialog}>
                            {intl.formatMessage({ id: "pages.dam.importFromPicsum.dialog.cancel", defaultMessage: "Cancel" })}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="reload" />}
                            disabled={(picsumImage === undefined && !hasLoadingFailed) || isImporting}
                            onClick={shuffle}
                        >
                            {intl.formatMessage({ id: "pages.dam.importFromPicsum.dialog.shuffle", defaultMessage: "Shuffle" })}
                        </Button>
                        <Button startIcon={<Icon name="download" />} disabled={picsumImage === undefined} loading={isImporting} onClick={importImage}>
                            {intl.formatMessage({ id: "pages.dam.importFromPicsum.dialog.import", defaultMessage: "Import" })}
                        </Button>
                    </>
                }
            >
                <ImagePreview>
                    {hasLoadingFailed ? (
                        <EmptyState
                            icon={<Icon name="warning" />}
                            title={intl.formatMessage({
                                id: "pages.dam.importFromPicsum.dialog.loadingFailed",
                                defaultMessage: "The photo couldn't be loaded",
                            })}
                            description={intl.formatMessage({
                                id: "pages.dam.importFromPicsum.dialog.loadingFailedDescription",
                                defaultMessage: "Check the connection to picsum.photos and shuffle to try again.",
                            })}
                        />
                    ) : picsumImage ? (
                        <img
                            src={picsumImage.url}
                            alt={intl.formatMessage({
                                id: "pages.dam.importFromPicsum.dialog.preview",
                                defaultMessage: "Random photo from Lorem Picsum",
                            })}
                        />
                    ) : (
                        <Spinner
                            aria-label={intl.formatMessage({ id: "pages.dam.importFromPicsum.dialog.loading", defaultMessage: "Loading a photo" })}
                        />
                    )}
                </ImagePreview>
            </Dialog>
            {uploadDialogs}
        </>
    );
};

const ImagePreview = styled("div")`
    display: grid;
    place-items: center;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--dextinity-radius-item);
    background-color: var(--dextinity-color-surface-sunken);

    > img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
    }
`;
