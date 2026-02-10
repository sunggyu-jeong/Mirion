export const TAG_LIST = ["HISTORY", "ETH_PRICE"] as const;

export type TagType = (typeof TAG_LIST)[number];
