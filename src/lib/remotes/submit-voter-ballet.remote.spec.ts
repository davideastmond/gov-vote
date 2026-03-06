import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetRequestEvent, mockVerifyJWT, mockDb } = vi.hoisted(() => ({
	mockGetRequestEvent: vi.fn(),
	mockVerifyJWT: vi.fn(),
	mockDb: {
		query: {
			voterCard: {
				findFirst: vi.fn()
			}
		},
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn()
	}
}));

vi.mock('$app/server', () => ({
	command: (_mode: string, handler: Record<string, unknown>) => {
		handler.__ = { type: 'command' };
		return handler;
	},
	getRequestEvent: mockGetRequestEvent
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

vi.mock('$lib/server/utils/jwt/jwt', () => ({
	verifyJWT: mockVerifyJWT
}));

import { submitVoterBallot } from './submit-voter-ballot.remote';

describe('submitVoterBallot', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockGetRequestEvent.mockReturnValue({
			cookies: {
				get: vi.fn().mockReturnValue('valid-token')
			}
		});

		mockVerifyJWT.mockResolvedValue({ sub: 'card-code-1' });

		mockDb.query.voterCard.findFirst.mockResolvedValue({
			id: 'voter-card-1',
			cardCode: 'card-code-1',
			contestGroupId: 'group-1',
			userId: 'user-1',
			cardStatus: 'active'
		});

		const innerJoin = vi.fn().mockResolvedValue([
			{
				voter_eligibility: {
					id: 'elig-1',
					contestId: 'contest-1'
				}
			}
		]);

		const where = vi.fn().mockReturnValue({ innerJoin });
		const from = vi.fn().mockReturnValue({ where });
		mockDb.select.mockReturnValue({ from });

		const insertValues = vi.fn().mockResolvedValue(undefined);
		mockDb.insert.mockReturnValue({ values: insertValues });

		const updateWhere = vi.fn().mockResolvedValue(undefined);
		const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
		mockDb.update.mockReturnValue({ set: updateSet });
	});

	it('returns validation errors for malformed ballot data', async () => {
		const result = await submitVoterBallot({ 'contest-1': 'not-an-array' } as unknown as Record<
			string,
			string[]
		>);

		expect(result.success).toBe(false);
		expect(result.errors).toHaveProperty('contest-1');
	});

	it('rejects when voter token is missing', async () => {
		mockGetRequestEvent.mockReturnValue({
			cookies: {
				get: vi.fn().mockReturnValue(undefined)
			}
		});

		const result = await submitVoterBallot({ 'contest-1': ['item-1'] });

		expect(result).toEqual({
			success: false,
			errors: { voterToken: 'Unauthorized request: missing token credentials' }
		});
	});

	it('rejects when voter card lookup fails', async () => {
		mockDb.query.voterCard.findFirst.mockResolvedValue(undefined);

		const result = await submitVoterBallot({ 'contest-1': ['item-1'] });

		expect(result).toEqual({
			success: false,
			errors: {
				voterCard:
					'Invalid voter card and/or voter card status. Please check your elections administrator.'
			}
		});
	});

	it('rejects when submitted contest is not in voter eligibility records', async () => {
		const result = await submitVoterBallot({ 'contest-not-eligible': ['item-1'] });

		expect(result).toEqual({
			success: false,
			errors: {
				contestId: 'We cannot process the submission for this ballot'
			}
		});
		expect(mockDb.insert).not.toHaveBeenCalled();
	});

	it('writes voter choices and marks eligibility/card status on successful submission', async () => {
		const innerJoin = vi.fn().mockResolvedValue([
			{
				voter_eligibility: {
					id: 'elig-1',
					contestId: 'contest-1'
				}
			},
			{
				voter_eligibility: {
					id: 'elig-2',
					contestId: 'contest-2'
				}
			}
		]);
		const where = vi.fn().mockReturnValue({ innerJoin });
		const from = vi.fn().mockReturnValue({ where });
		mockDb.select.mockReturnValue({ from });

		const result = await submitVoterBallot({
			'contest-1': ['item-1', 'item-2'],
			'contest-2': ['item-3']
		});

		expect(result).toEqual({ success: true });
		expect(mockDb.insert).toHaveBeenCalledTimes(3);
		expect(mockDb.update).toHaveBeenCalledTimes(2);
	});
});
