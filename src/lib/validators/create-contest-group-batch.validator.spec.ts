import { describe, expect, it } from 'vitest';
import { createContestGroupBatchValidator } from './create-contest-group-batch.validator';

const validBatchPayload = {
	contestGroups: [
		{
			title: 'General Election 2026',
			description: 'Statewide contests',
			adminIds: ['11111111-1111-4111-8111-111111111111'],
			contests: [
				{
					title: 'Mayor',
					description: 'City mayor race',
					contestStatus: 'active',
					items: [
						{
							title: 'Candidate A',
							auxiliaryText: 'Independent',
							contestItemType: 'candidate'
						}
					]
				}
			],
			pollingStationAddresses: [
				{
					name: 'Central High School',
					streetAddress: '123 Main St',
					city: 'Springfield',
					state: 'IL',
					zipCode: '62701'
				}
			]
		}
	]
} as const;

describe('createContestGroupBatchValidator', () => {
	it('accepts a valid batch payload', () => {
		const result = createContestGroupBatchValidator.safeParse(validBatchPayload);
		expect(result.success).toBe(true);
	});

	it('accepts multiple contest groups', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: [
				...validBatchPayload.contestGroups,
				{
					...validBatchPayload.contestGroups[0],
					title: 'Special Election 2026'
				}
			]
		});
		expect(result.success).toBe(true);
	});

	it('accepts a complex nested payload with multiple contests and item types', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: [
				{
					title: 'General Election 2026',
					description: 'Statewide ballot',
					adminIds: [
						'22222222-2222-4222-8222-222222222222',
						'33333333-3333-4333-8333-333333333333'
					],
					contests: [
						{
							title: 'Mayor',
							description: 'City mayor race',
							contestStatus: 'active',
							items: [
								{ title: 'Jane Doe', contestItemType: 'candidate' },
								{ title: 'John Smith', contestItemType: 'candidate' }
							]
						},
						{
							title: 'Transit Funding Initiative',
							description: 'Public transit funding measure',
							contestStatus: 'upcoming',
							items: [
								{
									title: 'Approve Initiative',
									auxiliaryText: 'Increase sales tax by 0.5%',
									contestItemType: 'initiative'
								},
								{
									title: 'Reject Initiative',
									contestItemType: 'other'
								}
							]
						}
					],
					pollingStationAddresses: [
						{
							name: 'Central High School',
							streetAddress: '123 Main St',
							city: 'Springfield',
							state: 'IL',
							zipCode: '62701'
						},
						{
							name: 'North Community Center',
							streetAddress: '456 Oak Ave',
							city: 'Springfield',
							state: 'IL',
							zipCode: '62702'
						}
					]
				},
				{
					title: 'School Board Special Election',
					contests: [
						{
							title: 'District 3 Seat',
							contestStatus: 'active',
							items: [
								{ title: 'Candidate X', contestItemType: 'candidate' },
								{ title: 'Candidate Y', contestItemType: 'candidate' }
							]
						}
					],
					pollingStationAddresses: [
						{
							streetAddress: '789 Pine Rd',
							city: 'Shelbyville',
							state: 'IL',
							zipCode: '62565'
						}
					]
				}
			]
		});

		expect(result.success).toBe(true);
	});

	it('rejects when contestGroups is empty', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects contest group with no contests', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: [
				{
					...validBatchPayload.contestGroups[0],
					contests: []
				}
			]
		});
		expect(result.success).toBe(false);
	});

	it('rejects contest group with no polling station addresses', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: [
				{
					...validBatchPayload.contestGroups[0],
					pollingStationAddresses: []
				}
			]
		});
		expect(result.success).toBe(false);
	});

	it('rejects contest item with invalid type', () => {
		const result = createContestGroupBatchValidator.safeParse({
			contestGroups: [
				{
					...validBatchPayload.contestGroups[0],
					contests: [
						{
							...validBatchPayload.contestGroups[0].contests[0],
							items: [
								{
									...validBatchPayload.contestGroups[0].contests[0].items[0],
									contestItemType: 'invalid-type'
								}
							]
						}
					]
				}
			]
		});
		expect(result.success).toBe(false);
	});
});
