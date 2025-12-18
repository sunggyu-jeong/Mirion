export const TAG_LIST = [
  'History',
] as const;

export type TagType = (typeof TAG_LIST)[number];