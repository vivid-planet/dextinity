import type { GraphQLFieldResolver } from "graphql";

import { sleep } from "./handlers";

type FolderMockData = {
    id: string;
    name: string;
    parentId: string | null;
};
const folders: FolderMockData[] = [
    { id: "1", name: "Media Root", parentId: null },

    // Level 1 (direct children of root)
    { id: "2", name: "Products", parentId: "1" },
    { id: "18", name: "Banners", parentId: "1" },
    { id: "22", name: "Logos", parentId: "1" },
    { id: "27", name: "Documents", parentId: "1" },
    { id: "28", name: "Videos", parentId: "1" },

    // Level 2 under Products
    { id: "3", name: "Shoes", parentId: "2" },
    { id: "14", name: "Bags", parentId: "2" },
    { id: "29", name: "Accessories", parentId: "2" },
    { id: "30", name: "Clothing", parentId: "2" },

    // Level 3 under Shoes
    { id: "4", name: "Running Shoes", parentId: "3" },
    { id: "11", name: "Sneakers", parentId: "3" },
    { id: "31", name: "Boots", parentId: "3" },
    { id: "32", name: "Sandals", parentId: "3" },

    // Level 4 under Running Shoes
    { id: "5", name: "Men", parentId: "4" },
    { id: "8", name: "Women", parentId: "4" },
    { id: "33", name: "Kids", parentId: "4" },

    // Level 5 under Men
    { id: "6", name: "High Resolution", parentId: "5" },
    { id: "7", name: "Thumbnails", parentId: "5" },
    { id: "34", name: "Web Optimized", parentId: "5" },

    // Level 5 under Women
    { id: "9", name: "High Resolution", parentId: "8" },
    { id: "10", name: "Thumbnails", parentId: "8" },
    { id: "35", name: "Web Optimized", parentId: "8" },

    // Level 4 under Sneakers
    { id: "12", name: "Lifestyle", parentId: "11" },
    { id: "13", name: "Sport", parentId: "11" },
    { id: "36", name: "Limited Edition", parentId: "11" },

    // Level 3 under Bags
    { id: "15", name: "Backpacks", parentId: "14" },
    { id: "37", name: "Suitcases", parentId: "14" },
    { id: "38", name: "Handbags", parentId: "14" },

    // Level 4 under Backpacks
    { id: "16", name: "Studio", parentId: "15" },
    { id: "17", name: "Outdoor", parentId: "15" },
    { id: "39", name: "School", parentId: "15" },

    // Level 2 under Banners
    { id: "19", name: "Homepage", parentId: "18" },
    { id: "40", name: "Category Pages", parentId: "18" },
    { id: "41", name: "Campaigns", parentId: "18" },

    // Level 3 under Homepage
    { id: "20", name: "Spring Campaign", parentId: "19" },
    { id: "21", name: "Summer Campaign", parentId: "19" },
    { id: "42", name: "Winter Campaign", parentId: "19" },

    // Level 2 under Logos
    { id: "23", name: "Brand", parentId: "22" },
    { id: "43", name: "Partner Logos", parentId: "22" },
    { id: "44", name: "Event Logos", parentId: "22" },

    // Level 3 under Brand
    { id: "24", name: "Primary", parentId: "23" },
    { id: "45", name: "Secondary", parentId: "23" },

    // Level 4 under Primary
    { id: "25", name: "SVG", parentId: "24" },
    { id: "26", name: "PNG", parentId: "24" },
    { id: "46", name: "JPG", parentId: "24" },
];

type Folder = {
    id: string;
    name: string;
};

export const folderHandler: GraphQLFieldResolver<unknown, unknown, { id?: string }> = async (_source, { id }): Promise<Folder | null> => {
    await sleep(250);

    const row = id
        ? folders.find((folder) => {
              return folder.id === id;
          })
        : folders.find((folder) => {
              return folder.parentId === null;
          });

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        name: row.name,
    };
};

export const subfolderHandler: GraphQLFieldResolver<unknown, unknown, { id?: string }> = async (_source, { id }): Promise<Folder[]> => {
    await sleep(500);

    if (!id) {
        const root = folders.find((folder) => {
            return folder.parentId === null;
        });
        if (!root) {
            return [];
        }
        return [
            {
                id: root.id,
                name: root.name,
            },
        ];
    }

    return folders
        .filter((folder) => {
            return folder.parentId === id;
        })
        .map((row) => ({
            id: row.id,
            name: row.name,
        }));
};
