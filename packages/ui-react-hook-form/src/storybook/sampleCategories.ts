/** A product category as an API would return it. */
export interface Category {
    id: string;
    title: string;
}

const categories: Category[] = [
    "Backpacks",
    "Bike accessories",
    "Camping",
    "Climbing",
    "Footwear",
    "Headlamps",
    "Jackets",
    "Rain gear",
    "Ski touring",
    "Tents",
].map((title, index) => ({ id: String(index + 1), title }));

/** A stand-in for an API: finds categories by title after a short delay. */
export function searchCategories(query: string, { signal }: { signal: AbortSignal }) {
    return new Promise<Category[]>((resolve, reject) => {
        const timeout = setTimeout(() => resolve(categories.filter((category) => category.title.toLowerCase().includes(query.toLowerCase()))), 200);
        signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(signal.reason);
        });
    });
}

/** A stand-in for an API that saves a new category. */
export async function createCategory(title: string): Promise<Category> {
    return { id: `new-${title.toLowerCase()}`, title };
}
