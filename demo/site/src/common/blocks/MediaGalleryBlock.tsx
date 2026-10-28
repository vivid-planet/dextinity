import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { MediaGalleryBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import {
    Carousel,
    CarouselNextButton,
    CarouselPreviousButton,
    CarouselSlide,
    CarouselStatus,
    CarouselViewport,
} from "@src/common/components/Carousel";
import { Typography } from "@src/common/components/Typography";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import clsx from "clsx";
import { useIntl } from "react-intl";

import styles from "./MediaGalleryBlock.module.scss";

type MediaGalleryBlockProps = PropsWithData<MediaGalleryBlockData>;

export const MediaGalleryBlock = withPreview(
    ({ data }: MediaGalleryBlockProps) => {
        const intl = useIntl();

        return (
            <Carousel
                label={intl.formatMessage({ id: "mediaGalleryBlock.ariaLabel", defaultMessage: "Media gallery" })}
                slideCount={data.items.blocks.length}
            >
                <CarouselPreviousButton className={clsx(styles.navigationButton, styles["navigationButton--previous"])} />
                <AnimateBoxInOnScroll direction="bottom">
                    <CarouselViewport>
                        {data.items.blocks.map((block, index) => (
                            <CarouselSlide key={block.key} index={index} inViewClassName={styles["slide--inView"]}>
                                <MediaBlock data={block.props.media} aspectRatio={data.aspectRatio} />
                                <Typography variant="paragraph200" className={styles.mediaCaption}>
                                    {block.props.caption}
                                </Typography>
                            </CarouselSlide>
                        ))}
                    </CarouselViewport>
                </AnimateBoxInOnScroll>
                <CarouselStatus as={Typography} variant="paragraph300" className={styles.customPagination} />
                <CarouselNextButton className={clsx(styles.navigationButton, styles["navigationButton--next"])} />
            </Carousel>
        );
    },
    { label: "MediaGallery" },
);

export const PageContentMediaGalleryBlock = (props: MediaGalleryBlockProps) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <MediaGalleryBlock {...props} />
        </div>
    </PageLayout>
);
