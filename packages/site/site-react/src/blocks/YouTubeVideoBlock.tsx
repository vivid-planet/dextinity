"use client";

import clsx from "clsx";
import { type ComponentType, type ReactElement, type ReactNode, useCallback, useRef, useState } from "react";

import type { YouTubeVideoBlockData } from "../blocks.generated";
import { withPreview } from "../iframebridge/withPreview";
import { PreviewSkeleton } from "../previewskeleton/PreviewSkeleton";
import { PlayPauseButton, type PlayPauseButtonProps } from "./helpers/PlayPauseButton";
import { useIsElementInViewport } from "./helpers/useIsElementInViewport";
import type { VideoPreviewImageProps } from "./helpers/VideoPreviewImage";
import type { PropsWithData } from "./PropsWithData";
import styles from "./YouTubeVideoBlock.module.scss";

const EXPECTED_YT_ID_LENGTH = 11;

const parseYoutubeIdentifier = (value: string): string | undefined => {
    // regex from https://stackoverflow.com/a/51870158
    const regExp =
        /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-zA-Z-]+)/;
    const match = value.match(regExp);
    const youtubeId = value.length === EXPECTED_YT_ID_LENGTH ? value : match && match[8].length === EXPECTED_YT_ID_LENGTH ? match[8] : null;

    return youtubeId ?? undefined;
};

interface YouTubeVideoBlockProps extends PropsWithData<YouTubeVideoBlockData> {
    aspectRatio?: string;
    previewImageSizes?: string;
    renderPreviewImage: (props: VideoPreviewImageProps) => ReactElement;
    fill?: boolean;
    previewImageIcon?: ReactNode;
    playButtonAriaLabel?: string;
    pauseButtonAriaLabel?: string;
    playPauseButton?: ComponentType<PlayPauseButtonProps>;
}

export const YouTubeVideoBlock = withPreview(
    ({
        data: { youtubeIdentifier, autoplay, loop, showControls, previewImage },
        aspectRatio = "16x9",
        previewImageSizes,
        renderPreviewImage,
        fill,
        previewImageIcon,
        playButtonAriaLabel,
        pauseButtonAriaLabel,
        playPauseButton: PlayPauseButtonComponent,
    }: YouTubeVideoBlockProps) => {
        const [showPreviewImage, setShowPreviewImage] = useState(true);
        const [isPlaying, setIsPlaying] = useState(autoplay ?? false);
        const [isHandledManually, setIsHandledManually] = useState(false);
        const hasPreviewImage = !!(previewImage && previewImage.damFile);
        const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);
        const iframeRef = setIframeElement;
        const inViewRef = useRef<HTMLDivElement>(null);

        const pauseYouTubeVideo = useCallback(() => {
            iframeElement?.contentWindow?.postMessage(`{"event":"command","func":"pauseVideo","args":""}`, "https://www.youtube-nocookie.com");
        }, [iframeElement]);

        const playYouTubeVideo = useCallback(() => {
            iframeElement?.contentWindow?.postMessage(`{"event":"command","func":"playVideo","args":""}`, "https://www.youtube-nocookie.com");
        }, [iframeElement]);

        const handleInView = useCallback(
            (inView: boolean) => {
                if (!isHandledManually) {
                    if (inView && autoplay) {
                        playYouTubeVideo();
                        setIsPlaying(true);
                    } else {
                        pauseYouTubeVideo();
                        setIsPlaying(false);
                    }
                }
            },
            [autoplay, isHandledManually, playYouTubeVideo, pauseYouTubeVideo],
        );

        useIsElementInViewport(inViewRef, handleInView);

        if (!youtubeIdentifier) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} />;
        }

        const identifier = parseYoutubeIdentifier(youtubeIdentifier);
        const searchParams = new URLSearchParams();
        searchParams.append("modestbranding", "1");
        searchParams.append("rel", "0");
        searchParams.append("enablejsapi", "1");

        const hasPreviewImageBeenHidden = hasPreviewImage && !showPreviewImage;

        // start playing the video when the preview image has been hidden
        if (hasPreviewImageBeenHidden) {
            searchParams.append("autoplay", "1");
        }

        // browsers only allow unmuted autoplay after a user interaction, which the click on the preview image provides
        if (autoplay && !hasPreviewImageBeenHidden) {
            searchParams.append("mute", "1");
        }

        if (showControls !== undefined) {
            searchParams.append("controls", Number(showControls).toString());
        }

        if (loop !== undefined) {
            searchParams.append("loop", Number(loop).toString());
        }
        if (loop && identifier) {
            searchParams.append("playlist", identifier);
        }

        const youtubeBaseUrl = "https://www.youtube-nocookie.com/embed/";
        const youtubeUrl = new URL(`${youtubeBaseUrl}${identifier ?? ""}`);
        youtubeUrl.search = searchParams.toString();

        const handlePreviewPlay = () => {
            setShowPreviewImage(false);
            setIsPlaying(true);
            setIsHandledManually(true);
        };

        const handlePlayPauseClick = () => {
            if (isPlaying) {
                setIsPlaying(false);
                setIsHandledManually(true);

                pauseYouTubeVideo();
            } else {
                setIsPlaying(true);
                playYouTubeVideo();
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
                        <iframe
                            ref={iframeRef}
                            className={styles.youtubeContainer}
                            allow="autoplay"
                            referrerPolicy="strict-origin-when-cross-origin"
                            src={youtubeUrl.toString()}
                        />
                    </div>
                )}
            </>
        );
    },
    { label: "Video" },
);
