"use client";
import { ListBlock, type PropsWithData } from "@dextinity/site-nextjs";
import type { StageBlockData } from "@src/blocks.generated";

import { BasicStageBlock } from "./BasicStageBlock";

export const StageBlock = ({ data }: PropsWithData<StageBlockData>) => {
    return <ListBlock data={data} block={(block) => <BasicStageBlock data={block} />} />;
};
