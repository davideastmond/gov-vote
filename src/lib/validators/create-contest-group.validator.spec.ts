import { describe, expect, it } from 'vitest';
import { createContestGroupValidator } from './create-contest-group.validator';

const validPayload = {
	id: '11111111-1111-4111-8111-111111111111',
	title: 'General Election 2026',
	description: 'Statewide contests',
	adminIds: ['admin-1'],
	contests: [
		{
			id: '22222222-2222-4222-8222-222222222222',
			title: 'Mayor',
			description: 'City mayor race',
			contestStatus: 'active',
			items: [
				{
					id: '33333333-3333-4333-8333-333333333333',
					title: 'Candidate A',
					auxiliaryText: 'Independent',
					contestItemType: 'candidate'
				}
			]
		}
	],
	pollingStationAddresses: [
		{
			streetAddress: '123 Main St',
			city: 'Springfield',
			state: 'IL',
			zipCode: '62701'
		}
	]
};

describe('createContestGroupValidator', () => {
	it('accepts a valid payload', () => {
		const result = createContestGroupValidator.safeParse(validPayload);
		expect(result.success).toBe(true);
	});

	it('rejects an empty contest list', () => {
		const result = createContestGroupValidator.safeParse({
			...validPayload,
			contests: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects contests without items', () => {
		const result = createContestGroupValidator.safeParse({
			...validPayload,
			contests: [
				{
					...validPayload.contests[0],
					items: []
				}
			]
		});
		expect(result.success).toBe(false);
	});

	it('rejects when no contest is active', () => {
		const result = createContestGroupValidator.safeParse({
			...validPayload,
			contests: [
				{
					...validPayload.contests[0],
					contestStatus: 'upcoming'
				}
			]
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing polling station addresses', () => {
		const result = createContestGroupValidator.safeParse({
			...validPayload,
			pollingStationAddresses: []
		});
		expect(result.success).toBe(false);
	});
});
