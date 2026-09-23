// Allows injecting the News entity without importing it, which would cause a circular import (News → NewsContentBlock → … → NewsLinkBlock)
export const NEWS_ENTITY = Symbol("NEWS_ENTITY");
