import type { Type } from "@nestjs/common";
import { INJECTABLE_WATERMARK } from "@nestjs/common/constants";

export function isInjectableService<T>(target: object): target is Type<T> {
    return Reflect.hasMetadata(INJECTABLE_WATERMARK, target);
}
