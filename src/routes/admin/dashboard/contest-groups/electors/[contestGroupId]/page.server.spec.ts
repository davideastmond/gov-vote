import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	mockQueryContestGroupFindFirst,
	mockQueryAdminContestGroupFindFirst,
	mockRequireAdminSession,
	mockSelect,
	mockFrom,
	mockInnerJoin1,
	mockInnerJoin2,
	mockInnerJoin3,
	mockOrderBy,
	mockWhere
} = vi.hoisted(() => {
	const mockOrderBy = vi.fn().mockResolvedValue([]);
	const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
	const mockInnerJoin3 = vi.fn(() => ({ orderBy: mockOrderBy }));
	const mockInnerJoin2 = vi.fn(() => ({ innerJoin: mockInnerJoin3 }));
	const mockInnerJoin1 = vi.fn(() => ({ innerJoin: mockInnerJoin2 }));
	const mockFrom = vi.fn(() => ({ innerJoin: mockInnerJoin1, where: mockWhere }));
	const mockSelect = vi.fn(() => ({ from: mockFrom }));

	return {
		mockQueryContestGroupFindFirst: vi.fn(),
		mockQueryAdminContestGroupFindFirst: vi.fn(),
		mockRequireAdminSession: vi.fn(),
		mockSelect,
		mockFrom,
		mockInnerJoin1,
		mockInnerJoin2,
		mockInnerJoin3,
		mockOrderBy,
		mockWhere
	};
});

vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			contestGroup: { findFirst: mockQueryContestGroupFindFirst },
			adminContestGroup: { findFirst: mockQueryAdminContestGroupFindFirst }
		},
		select: mockSelect
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	contest: {},
	contestItem: {},
	user: {},
	voterChoice: {},
	voterIdPhoto: {}
}));

vi.mock('$lib/server/utils/require-admin-session', () => ({
	requireAdminSession: mockRequireAdminSession
}));

vi.mock('drizzle-orm', () => ({
	and: (...args: unknown[]) => ({ type: 'and', args }),
	asc: (field: unknown) => ({ type: 'asc', field }),
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (...args: unknown[]) => ({ type: 'eq', args }),
	inArray: (...args: unknown[]) => ({ type: 'inArray', args })
}));

import { load } from './+page.server';

const makeUrl = (search = '') =>
	new URL(
		`http://localhost/admin/dashboard/contest-groups/electors/test-group-id${search}`
	) as unknown as URL;

const adminSession = { user: { id: 'admin-1', role: 'admin' } };
const superAdminSession = { user: { id: 'super-1', role: 'super_admin' } };

const closedContestGroup = {
	id: 'test-group-id',
	title: 'Test Election',
	description: 'A test election',
	contestGroupStatus: 'closed'
};

const openContestGroup = {
	id: 'test-group-id',
	title: 'Test Election',
	description: null,
	contestGroupStatus: 'open'
};

describe('/admin/dashboard/contest-groups/electors/[contestGroupId]/+page.server.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue({ from: mockFrom });
		mockFrom.mockReturnValue({ innerJoin: mockInnerJoin1, where: mockWhere });
		mockInnerJoin1.mockReturnValue({ innerJoin: mockInnerJoin2 });
		mockInnerJoin2.mockReturnValue({ innerJoin: mockInnerJoin3 });
		mockInnerJoin3.mockReturnValue({ orderBy: mockOrderBy });
		mockWhere.mockReturnValue({ orderBy: mockOrderBy });
		mockOrderBy.mockResolvedValue([]);
	});

	it('redirects to admin login when session is not present', async () => {
		mockRequireAdminSession.mockRejectedValue({ status: 302, location: '/admin/login' });

		await expect(
			load({
				params: { contestGroupId: 'test-group-id' },
				locals: { auth: async () => null },
				url: makeUrl()
			} as never)
		).rejects.toMatchObject({ status: 302, location: '/admin/login' });
	});

	it('throws 404 when contest group is not found', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(null);

		await expect(
			load({
				params: { contestGroupId: 'test-group-id' },
				locals: {},
				url: makeUrl()
			} as never)
		).rejects.toMatchObject({ status: 404 });
	});

	it('throws 403 when admin does not have access to the contest group', async () => {
		mockRequireAdminSession.mockResolvedValue(adminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);
		mockQueryAdminContestGroupFindFirst.mockResolvedValue(null);

		await expect(
			load({
				params: { contestGroupId: 'test-group-id' },
				locals: {},
				url: makeUrl()
			} as never)
		).rejects.toMatchObject({ status: 403 });
	});

	it('throws 400 when contest group is not closed', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(openContestGroup);

		await expect(
			load({
				params: { contestGroupId: 'test-group-id' },
				locals: {},
				url: makeUrl()
			} as never)
		).rejects.toMatchObject({ status: 400 });
	});

	it('does not check admin access for super_admin role', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl()
		} as never);

		expect(mockQueryAdminContestGroupFindFirst).not.toHaveBeenCalled();
		expect(result).toMatchObject({
			contestGroup: { id: 'test-group-id', status: 'closed' },
			electors: [],
			pagination: { currentPage: 1, totalPages: 1, totalElectors: 0, pageSize: 10 }
		});
	});

	it('allows admin with access to view closed contest group', async () => {
		mockRequireAdminSession.mockResolvedValue(adminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);
		mockQueryAdminContestGroupFindFirst.mockResolvedValue({ contestGroupId: 'test-group-id', adminId: 'admin-1' });

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl()
		} as never);

		expect(result).toMatchObject({
			contestGroup: { id: 'test-group-id', status: 'closed' },
			electors: []
		});
	});

	it('returns electors data for a closed contest group', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);

		const voteRows = [
			{
				userId: 'user-1',
				firstName: 'Alice',
				lastName: 'Smith',
				username: 'asmith',
				contestId: 'contest-1',
				contestTitle: 'Mayor',
				contestItemTitle: 'Candidate A',
				createdAt: new Date('2024-01-01T10:00:00Z')
			},
			{
				userId: 'user-1',
				firstName: 'Alice',
				lastName: 'Smith',
				username: 'asmith',
				contestId: 'contest-2',
				contestTitle: 'Council',
				contestItemTitle: 'Candidate B',
				createdAt: new Date('2024-01-01T11:00:00Z')
			}
		];

		mockOrderBy.mockResolvedValueOnce(voteRows).mockResolvedValueOnce([]);

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl()
		} as never);

		expect(result.electors).toHaveLength(1);
		expect(result.electors[0]).toMatchObject({
			userId: 'user-1',
			firstName: 'Alice',
			lastName: 'Smith',
			username: 'asmith',
			contests: [
				{ contestId: 'contest-1', contestTitle: 'Mayor', selections: ['Candidate A'] },
				{ contestId: 'contest-2', contestTitle: 'Council', selections: ['Candidate B'] }
			]
		});
		expect(result.pagination.totalElectors).toBe(1);
	});

	it('attaches voter ID photo when one exists for an elector', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);

		const voteRows = [
			{
				userId: 'user-1',
				firstName: 'Bob',
				lastName: 'Jones',
				username: 'bjones',
				contestId: 'contest-1',
				contestTitle: 'Mayor',
				contestItemTitle: 'Candidate X',
				createdAt: new Date('2024-01-01T10:00:00Z')
			}
		];

		const photoRows = [
			{
				id: 'photo-1',
				userId: 'user-1',
				uploadedAt: new Date('2024-01-02T08:00:00Z')
			}
		];

		mockOrderBy.mockResolvedValueOnce(voteRows).mockResolvedValueOnce(photoRows);

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl()
		} as never);

		expect(result.electors[0].voterIdPhoto).toMatchObject({
			id: 'photo-1',
			photoProxyUrl: '/api/admin/voter-id-photo/photo-1'
		});
	});

	it('returns correct page 2 results when paginating', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);

		const voteRows = Array.from({ length: 15 }, (_, i) => ({
			userId: `user-${i}`,
			firstName: `First${i}`,
			lastName: `Last${i}`,
			username: `user${i}`,
			contestId: 'contest-1',
			contestTitle: 'Mayor',
			contestItemTitle: 'Candidate A',
			createdAt: new Date('2024-01-01T10:00:00Z')
		}));

		mockOrderBy.mockResolvedValueOnce(voteRows).mockResolvedValueOnce([]);

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl('?page=2')
		} as never);

		expect(result.electors).toHaveLength(5);
		expect(result.pagination).toMatchObject({
			currentPage: 2,
			totalPages: 2,
			totalElectors: 15,
			pageSize: 10
		});
	});

	it('clamps page number to last page when out of range', async () => {
		mockRequireAdminSession.mockResolvedValue(superAdminSession);
		mockQueryContestGroupFindFirst.mockResolvedValue(closedContestGroup);

		const voteRows = Array.from({ length: 5 }, (_, i) => ({
			userId: `user-${i}`,
			firstName: `First${i}`,
			lastName: `Last${i}`,
			username: `user${i}`,
			contestId: 'contest-1',
			contestTitle: 'Mayor',
			contestItemTitle: 'Candidate A',
			createdAt: new Date('2024-01-01T10:00:00Z')
		}));

		mockOrderBy.mockResolvedValueOnce(voteRows).mockResolvedValueOnce([]);

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl('?page=99')
		} as never);

		expect(result.pagination.currentPage).toBe(1);
		expect(result.electors).toHaveLength(5);
	});
});
