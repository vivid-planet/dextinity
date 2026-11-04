import type { JSX } from "react";

import type { PreviewContentImage } from "../../../types";
import * as sc from "./StackedImages.sc";

interface StackedImagesProps {
    images: PreviewContentImage[];
}

export function StackedImages({ images }: StackedImagesProps): JSX.Element {
    return (
        <sc.ImagesContainer>
            {
                /* One Image*/

                images.length === 1 && (
                    <sc.StackedImage>
                        <sc.Image src={images[0].content.src} />
                    </sc.StackedImage>
                )
            }

            {
                /* Two Images*/

                images.length === 2 && (
                    <>
                        <sc.TwoImagesStackedImageLeft>
                            <sc.Image src={images[0].content.src} />
                        </sc.TwoImagesStackedImageLeft>
                        <sc.TwoImagesStackedImageRight>
                            <sc.Image src={images[1].content.src} />
                        </sc.TwoImagesStackedImageRight>
                    </>
                )
            }

            {
                /* Three Images*/

                images.length >= 3 && (
                    <>
                        <sc.ThreeImagesStackedImageLeft>
                            <sc.Image src={images[0].content.src} />
                        </sc.ThreeImagesStackedImageLeft>
                        <sc.ThreeImagesStackedImageCenter>
                            <sc.Image src={images[1].content.src} />
                        </sc.ThreeImagesStackedImageCenter>
                        <sc.ThreeImagesStackedImageRight>
                            <sc.Image src={images[2].content.src} />
                        </sc.ThreeImagesStackedImageRight>
                    </>
                )
            }
        </sc.ImagesContainer>
    );
}
