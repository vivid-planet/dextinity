"use client";

import clsx from "clsx";
import { type ComponentType, type ReactElement, type ReactNode, useCallback, useState } from "react";

import { AiContentDisclosure, type AiContentDisclosureProps } from "../aiContentDisclosure/AiContentDisclosure";
import { type AiContentAltTextPrefixLabels, getAiContentAltTextWithPrefix } from "../aiContentDisclosure/getAiContentAltTextWithPrefix";
import type { DamVideoBlockData } from "../blocks.generated";
import { withPreview } from "../iframebridge/withPreview";
import { PreviewSkeleton } from "../previewskeleton/PreviewSkeleton";
import styles from "./DamVideoBlock.module.scss";
import { PlayPauseButton, type PlayPauseButtonProps } from "./helpers/PlayPauseButton";
import { useIsElementInViewport } from "./helpers/useIsElementInViewport";
import type { VideoPreviewImageProps } from "./helpers/VideoPreviewImage";
import type { PropsWithData } from "./PropsWithData";

interface DamVideoBlockProps extends PropsWithData<DamVideoBlockData> {
    aspectRatio?: string;
    previewImageSizes?: string;
    renderPreviewImage: (props: VideoPreviewImageProps) => ReactElement;
    fill?: boolean;
    previewImageIcon?: ReactNode;
    playButtonAriaLabel?: string;
    pauseButtonAriaLabel?: string;
    playPauseButton?: ComponentType<PlayPauseButtonProps>;
    /** Override props passed to the AI content disclosure badge. */
    aiContentDisclosureProps?: Partial<AiContentDisclosureProps>;
    /** Render your own AI content disclosure instead of the built-in badge. Pass `null` to render none, e.g. when the project renders its own. */
    aiContentDisclosure?: ReactNode;
    /** AI content prefix prepended to the accessible name. Defaults to English; ideally pass a translated string here. */
    aiContentAltTextPrefixLabels?: Partial<AiContentAltTextPrefixLabels>;
}

export const DamVideoBlock = withPreview(
    ({
        data: { damFile, autoplay, loop, showControls, previewImage },
        aspectRatio = "16x9",
        previewImageSizes,
        renderPreviewImage,
        fill,
        previewImageIcon,
        playButtonAriaLabel,
        pauseButtonAriaLabel,
        playPauseButton: PlayPauseButtonComponent,
        aiContentDisclosureProps,
        aiContentDisclosure,
        aiContentAltTextPrefixLabels,
    }: DamVideoBlockProps) => {
        if (damFile === undefined) {
            return <PreviewSkeleton type="media" hasContent={false} aspectRatio={aspectRatio} />;
        }

        const ariaLabel = getAiContentAltTextWithPrefix({
            aiContentType: damFile?.aiContentType,
            description: damFile?.altText,
            prefixLabels: aiContentAltTextPrefixLabels,
        });

        const [showPreviewImage, setShowPreviewImage] = useState(true);
        const [isPlaying, setIsPlaying] = useState(autoplay ?? false);
        const [isHandledManually, setIsHandledManually] = useState(false);
        const hasPreviewImage = Boolean(previewImage && previewImage.damFile);

        const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

        const videoRef = useCallback(
            (element: HTMLVideoElement | null) => {
                setVideoElement(element);
                // The user gesture from clicking the preview image's play button does not extend to the
                // freshly-mounted <video> element, so the browser blocks autoplay for unmuted videos.
                // Call play() explicitly during the ref-callback to keep playback in the user gesture window.
                if (element && hasPreviewImage && !showPreviewImage && element.paused) {
                    element.play();
                }
            },
            [hasPreviewImage, showPreviewImage],
        );

        const handlePreviewPlay = () => {
            setShowPreviewImage(false);
            setIsPlaying(true);
            setIsHandledManually(true);
        };

        const handleInView = useCallback(
            (inView: boolean) => {
                if (!isHandledManually && videoElement) {
                    if (inView && autoplay) {
                        videoElement.play();
                        setIsPlaying(true);
                    } else {
                        videoElement.pause();
                        setIsPlaying(false);
                    }
                }
            },
            [autoplay, isHandledManually, videoElement],
        );

        useIsElementInViewport({ current: videoElement }, handleInView);

        const handlePlayPauseClick = () => {
            if (isPlaying) {
                setIsPlaying(false);
                setIsHandledManually(true);
                videoElement?.pause();
            } else {
                setIsPlaying(true);
                videoElement?.play();
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
                    <div className={styles.root}>
                        <video
                            autoPlay={autoplay}
                            controls={showControls}
                            loop={loop}
                            playsInline
                            muted={autoplay}
                            ref={videoRef}
                            aria-label={damFile.aiContentType ? ariaLabel : undefined}
                            className={clsx(styles.video, fill && styles.fill)}
                            style={!fill ? { "--aspect-ratio": aspectRatio.replace("x", " / ") } : undefined}
                        >
                            {damFile.captions?.map((caption) => {
                                return <track key={caption.id} src={caption.fileUrl} kind="captions" srcLang={caption.language} />;
                            })}
                            <source src={damFile.fileUrl} type={damFile.mimetype} />
                        </video>
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
                        {damFile.aiContentType &&
                            (aiContentDisclosure !== undefined ? (
                                aiContentDisclosure
                            ) : (
                                <AiContentDisclosure type={damFile.aiContentType} {...aiContentDisclosureProps} />
                            ))}
                    </div>
                )}
            </>
        );
    },
    { label: "Video" },
);
