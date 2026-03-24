import type { ContestItemType, ContestStatus } from './enums';
export type { ContestItemType, ContestStatus };

export type ContestItem = {
	id: string;
	title: string;
	auxiliaryText: string;
	contestItemType: ContestItemType;
};

export type Contest = {
	id: string;
	title: string;
	description: string;
	contestStatus: ContestStatus;
	items: ContestItem[];
};
