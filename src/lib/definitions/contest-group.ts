export type ContestItemType = 'candidate' | 'initiative' | 'other';
export type ContestStatus = 'upcoming' | 'active' | 'closed';

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
