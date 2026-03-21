export const CONTEST_ITEM_TYPE_VALUES = ['candidate', 'initiative', 'other'] as const;
export type ContestItemType = (typeof CONTEST_ITEM_TYPE_VALUES)[number];

export const CONTEST_STATUS_VALUES = ['upcoming', 'active', 'closed'] as const;
export type ContestStatus = (typeof CONTEST_STATUS_VALUES)[number];

export const VOTER_CARD_STATUS_VALUES = ['generated', 'active', 'inactive'] as const;
export type VoterCardStatus = (typeof VOTER_CARD_STATUS_VALUES)[number];
