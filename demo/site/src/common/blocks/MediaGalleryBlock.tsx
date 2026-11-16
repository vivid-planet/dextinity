import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import { useIntl } from "@dextinity/site-nextjs/intl";
import type { MediaGalleryBlockData } from "@src/blocks.generated";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { Carousel, CarouselNextButton, CarouselPreviousButton, CarouselSlide, CarouselViewport } from "@src/common/components/carousel/Carousel";
import { Typography } from "@src/common/components/Typography";
import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import clsx from "clsx";

import styles from "./MediaGalleryBlock.module.scss";
import { MediaGalleryStatus } from "./MediaGalleryStatus";

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
                        {data.items.blocks.map((block) => (
                            <CarouselSlide key={block.key} className={styles.slide}>
                                <MediaBlock data={block.props.media} aspectRatio={data.aspectRatio} />
                                <Typography variant="paragraph200" className={styles.mediaCaption}>
                                    {block.props.caption}
                                </Typography>
                            </CarouselSlide>
                        ))}
                    </CarouselViewport>
                </AnimateBoxInOnScroll>
                <MediaGalleryStatus className={styles.customPagination} />
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
