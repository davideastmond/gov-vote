import { describe, expect, it } from 'vitest';
import { normalizeBallotRows, type BallotRow } from './ballot-transform';

describe('normalizeBallotRows', () => {
	it('groups rows by contest and derives contest type', () => {
		const rows: BallotRow[] = [
			{
				contest: {
					id: 'contest-1',
					title: 'Mayor',
					description: 'Select one candidate'
				},
				contest_item: {
					id: 'item-1',
					title: 'Candidate A',
					auxiliaryText: 'Party A',
					contestItemType: 'candidate'
				}
			},
			{
				contest: {
					id: 'contest-1',
					title: 'Mayor',
					description: 'Select one candidate'
				},
				contest_item: {
					id: 'item-2',
					title: 'Candidate B',
					auxiliaryText: 'Party B',
					contestItemType: 'candidate'
				}
			},
			{
				contest: {
					id: 'contest-2',
					title: 'Referendum A',
					description: null
				},
				contest_item: {
					id: 'item-3',
					title: 'Yes',
					auxiliaryText: null,
					contestItemType: 'initiative'
				}
			},
			{
				contest: {
					id: 'contest-2',
					title: 'Referendum A',
					description: null
				},
				contest_item: {
					id: 'item-4',
					title: 'No',
					auxiliaryText: null,
					contestItemType: 'initiative'
				}
			}
		];

		const contests = normalizeBallotRows(rows);

		expect(contests).toHaveLength(2);
		expect(contests[0].id).toBe('contest-1');
		expect(contests[0].items).toHaveLength(2);
		expect(contests[0].type).toBe('election');
		expect(contests[1].id).toBe('contest-2');
		expect(contests[1].items).toHaveLength(2);
		expect(contests[1].type).toBe('referendum');
	});

	it('deduplicates repeated contest items', () => {
		const rows: BallotRow[] = [
			{
				contest: {
					id: 'contest-1',
					title: 'Mayor',
					description: null
				},
				contest_item: {
					id: 'item-1',
					title: 'Candidate A',
					auxiliaryText: null,
					contestItemType: 'candidate'
				}
			},
			{
				contest: {
					id: 'contest-1',
					title: 'Mayor',
					description: null
				},
				contest_item: {
					id: 'item-1',
					title: 'Candidate A',
					auxiliaryText: null,
					contestItemType: 'candidate'
				}
			}
		];

		const contests = normalizeBallotRows(rows);
		expect(contests).toHaveLength(1);
		expect(contests[0].items).toHaveLength(1);
	});
});
