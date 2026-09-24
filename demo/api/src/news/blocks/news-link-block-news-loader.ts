import type { News } from "@src/news/entities/news.entity";

// Implemented outside of the block because importing the News entity here would cause a circular import (News → NewsContentBlock → … → NewsLinkBlock)
export abstract class NewsLinkBlockNewsLoader {
    abstract load(id: string): Promise<News>;
}
