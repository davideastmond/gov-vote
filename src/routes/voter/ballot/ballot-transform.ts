export type BallotRow = {
	contest: {
		id: string;
		title: string;
		description: string | null;
	};
	contest_item: {
		id: string;
		title: string;
		auxiliaryText: string | null;
		contestItemType: 'candidate' | 'initiative' | 'other';
	};
};

export type BallotContestItem = {
	id: string;
	label: string;
	description?: string;
	type: 'candidate' | 'initiative' | 'other';
};

export type BallotContest = {
	id: string;
	title: string;
	description?: string;
	type: 'election' | 'referendum';
	maxChoices: number;
	items: BallotContestItem[];
};

function deriveContestType(items: BallotContestItem[]): BallotContest['type'] {
	return items.every((item) => item.type === 'initiative') ? 'referendum' : 'election';
}

export function normalizeBallotRows(ballotData: BallotRow[]): BallotContest[] {
	const groupedContests = new Map<string, BallotContest>();

	for (const row of ballotData) {
		const contestId = row.contest.id;

		if (!groupedContests.has(contestId)) {
			groupedContests.set(contestId, {
				id: contestId,
				title: row.contest.title,
				description: row.contest.description ?? undefined,
				type: 'election',
				maxChoices: 1,
				items: []
			});
		}

		const contestEntry = groupedContests.get(contestId);
		if (!contestEntry) continue;

		const alreadyAdded = contestEntry.items.some((item) => item.id === row.contest_item.id);
		if (!alreadyAdded) {
			contestEntry.items.push({
				id: row.contest_item.id,
				label: row.contest_item.title,
				description: row.contest_item.auxiliaryText ?? undefined,
				type: row.contest_item.contestItemType
			});
		}
	}

	return [...groupedContests.values()].map((contest) => ({
		...contest,
		type: deriveContestType(contest.items)
	}));
}
