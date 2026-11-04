"use client";
import clsx from "clsx";
import { type ComponentType, type ReactElement, type ReactNode, useCallback, useRef, useState } from "react";

import type { VimeoVideoBlockData } from "../blocks.generated";
import { withPreview } from "../iframebridge/withPreview";
import { PreviewSkeleton } from "../previewskeleton/PreviewSkeleton";
import { PlayPauseButton, type PlayPauseButtonProps } from "./helpers/PlayPauseButton";
import { useIsElementInViewport } from "./helpers/useIsElementInViewport";
import type { VideoPreviewImageProps } from "./helpers/VideoPreviewImage";
import type { PropsWithData } from "./PropsWithData";
import styles from "./VimeoVideoBlock.module.scss";

function parseVimeoIdentifier(vimeoIdentifier: string): string | undefined {
    const urlRegEx = /^(https?:\/\/)?((www\.|player\.)?vimeo\.com\/?(showcase\/)*([0-9a-z]*\/)*([0-9]{6,11})[?]?.*)$/;
    const idRegEx = /^([0-9]{6,11})$/;

    const urlRegExMatch = vimeoIdentifier.match(urlRegEx);
    const idRegExMatch = vimeoIdentifier.match(idRegEx);

    if (!urlRegExMatch && !idRegExMatch) {
        return undefined;
    }

    if (urlRegExMatch) {
        return urlRegExMatch[6];
    } else if (idRegExMatch) {
        return idRegExMatch[1];
    }
}

interface VimeoVideoBlockProps extends PropsWithData<VimeoVideoBlockData> {
    aspectRatio?: string;
    previewImageSizes?: string;
    renderPreviewImage: (props: VideoPreviewImageProps) => ReactElement;
    fill?: boolean;
    previewImageIcon?: ReactNode;
    playButtonAriaLabel?: string;
    pauseButtonAriaLabel?: string;
    playPauseButton?: ComponentType<PlayPauseButtonProps>;
}

export const VimeoVideoBlock = withPreview(
    ({
        data: { vimeoIdentifier, autoplay, loop, showControls, previewImage },
        aspectRatio = "16x9",
        previewImageSizes,
        renderPreviewImage,
        fill,
        previewImageIcon,
        playButtonAriaLabel,
        pauseButtonAriaLabel,
        playPauseButton: PlayPauseButtonComponent,
    }: VimeoVideoBlockProps) => {
        const [showPreviewImage, setShowPreviewImage] = useState(true);
        const hasPreviewImage = !!(previewImage && previewImage.damFile);
        const inViewRef = useRef<HTMLDivElement>(null);
        const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);
        const iframeRef = setIframeElement;
        const [isPlaying, setIsPlaying] = useState(autoplay ?? false);
        const [isHandledManually, setIsHandledManually] = useState(false);

        const pauseVimeoVideo = useCallback(() => {
            iframeElement?.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), "https://player.vimeo.com");
        }, [iframeElement]);

        const playVimeoVideo = useCallback(() => {
            iframeElement?.contentWindow?.postMessage(JSON.stringify({ method: "play" }), "https://player.vimeo.com");
        }, [iframeElement]);

        const handleInView = useCallback(
            (isVisible: boolean) => {
                if (!isHandledManually) {
                    if (isVisible && autoplay) {
                        playVimeoVideo();
                        setIsPlaying(true);
                    } else {
                        pauseVimeoVideo();
                        setIsPlaying(false);
                    }
                }
            },
            [autoplay, isHandledManually, playVimeoVideo, pauseVimeoVideo],
        );

        useIsElementInViewport(inViewRef, handleInView);

        if (!vimeoIdentifier) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} />;
        }

        const identifier = parseVimeoIdentifier(vimeoIdentifier);

        const hasPreviewImageBeenHidden = hasPreviewImage && !showPreviewImage;

        const searchParams = new URLSearchParams();
        if (autoplay || hasPreviewImageBeenHidden) {
            searchParams.append("autoplay", "1");
        }

        // browsers only allow unmuted autoplay after a user interaction, which the click on the preview image provides
        if (autoplay && !hasPreviewImageBeenHidden) {
            searchParams.append("muted", "1");
        }

        if (loop !== undefined) {
            searchParams.append("loop", Number(loop).toString());
        }

        if (showControls !== undefined) {
            searchParams.append("controls", Number(showControls).toString());
        }

        searchParams.append("dnt", "1");

        const vimeoBaseUrl = "https://player.vimeo.com/video/";
        const vimeoUrl = new URL(`${vimeoBaseUrl}${identifier ?? ""}`);
        vimeoUrl.search = searchParams.toString();

        const handlePreviewPlay = () => {
            setShowPreviewImage(false);
            setIsPlaying(true);
            setIsHandledManually(true);
        };

        const handlePlayPauseClick = () => {
            if (isPlaying) {
                setIsPlaying(false);
                setIsHandledManually(true);
                pauseVimeoVideo();
            } else {
                setIsPlaying(true);
                playVimeoVideo();
            }
        };

        return (
            <>
                {hasPreviewImage && showPreviewImage ? (
                    renderPreviewImage({
                        onPlay: handlePreviewPlay,
                        image: previewImage,
                        aspectRatio,
                        sizes: previewImageSizes,
                        fill: fill,
                        icon: previewImageIcon,
                        playButtonAriaLabel,
                    })
                ) : (
                    <div
                        ref={inViewRef}
                        className={clsx(styles.videoContainer, fill && styles.fill)}
                        style={!fill ? { "--aspect-ratio": aspectRatio.replace("x", "/") } : undefined}
                    >
                        <iframe
                            ref={iframeRef}
                            className={styles.vimeoContainer}
                            src={vimeoUrl.toString()}
                            allow="autoplay"
                            allowFullScreen
                            loading="lazy"
                        />
                        {!showControls &&
                            (PlayPauseButtonComponent ? (
                                <PlayPauseButtonComponent isPlaying={isPlaying} onClick={handlePlayPauseClick} />
                            ) : (
                                <PlayPauseButton
                                    isPlaying={isPlaying}
                                    onClick={handlePlayPauseClick}
                                    ariaLabelPlay={playButtonAriaLabel}
                                    ariaLabelPause={pauseButtonAriaLabel}
                                />
                            ))}
                    </div>
                )}
            </>
        );
    },
    { label: "Video" },
);
