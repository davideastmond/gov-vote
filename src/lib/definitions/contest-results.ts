import type { ContestItemType, ContestStatus } from './enums';

export type ItemResult = {
	contestItemId: string;
	contestItemTitle: string;
	contestItemType: ContestItemType;
	voteCount: number;
	voteShare: number;
};

export type ContestResult = {
	contestId: string;
	contestTitle: string;
	contestStatus: ContestStatus;
	totalVotes: number;
	items: ItemResult[];
};
