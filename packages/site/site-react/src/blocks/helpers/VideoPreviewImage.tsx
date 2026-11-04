import clsx from "clsx";
import type { ReactElement, ReactNode } from "react";

import type { PixelImageBlockData } from "../../blocks.generated";
import styles from "./VideoPreviewImage.module.scss";

export interface VideoPreviewImageProps {
    onPlay: () => void;
    image: PixelImageBlockData;
    aspectRatio: string;
    sizes?: string;
    fill?: boolean;
    icon?: ReactNode;
    className?: string;
    playButtonAriaLabel?: string;
}

export const VideoPreviewImage = ({
    onPlay,
    image,
    aspectRatio,
    sizes = "100vw",
    fill,
    playButtonAriaLabel = "Play video",
    icon = <PlayIcon playButtonAriaLabel={playButtonAriaLabel} />,
    className,
    renderImage,
}: VideoPreviewImageProps & {
    renderImage: (props: { data: PixelImageBlockData; aspectRatio: string; sizes?: string; fill?: boolean }) => ReactElement;
}) => {
    return (
        <div className={clsx(styles.root, fill && styles.fill, className)}>
            {renderImage({ data: image, aspectRatio, sizes, fill })}
            <button className={styles.iconWrapper} onClick={onPlay}>
                {icon}
            </button>
        </div>
    );
};

interface PlayIconProps {
    playButtonAriaLabel: string;
}

const PlayIcon = ({ playButtonAriaLabel }: PlayIconProps) => <span className={styles.playIcon} aria-label={playButtonAriaLabel} />;
