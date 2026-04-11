import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---- hoisted mocks ----
const {
	mockQueryContestGroupFindFirst,
	mockQueryAdminContestGroupFindFirst,
	mockRequireAdminSession,
	mockSelect,
	// Count query chain: select -> from -> innerJoin (resolves)
	mockCountInnerJoin,
	mockCountFrom,
	// Paged-users query chain: select -> from -> innerJoin -> innerJoin -> groupBy -> orderBy -> limit -> offset (resolves)
	mockPagedOffset,
	mockPagedLimit,
	mockPagedOrderBy,
	mockPagedGroupBy,
	mockPagedInnerJoin2,
	mockPagedInnerJoin1,
	mockPagedFrom,
	// Selections query chain: select -> from -> innerJoin -> innerJoin -> where -> orderBy (resolves)
	mockSelOrderBy,
	mockSelWhere,
	mockSelInnerJoin2,
	mockSelInnerJoin1,
	mockSelFrom,
	// Photos query chain: select -> from -> where -> orderBy (resolves)
	mockPhotoOrderBy,
	mockPhotoWhere,
	mockPhotoFrom
} = vi.hoisted(() => {
	// Count query terminal
	const mockCountInnerJoin = vi.fn().mockResolvedValue([{ totalElectors: 0 }]);
	const mockCountFrom = vi.fn(() => ({ innerJoin: mockCountInnerJoin }));

	// Paged-users query terminal
	const mockPagedOffset = vi.fn().mockResolvedValue([]);
	const mockPagedLimit = vi.fn(() => ({ offset: mockPagedOffset }));
	const mockPagedOrderBy = vi.fn(() => ({ limit: mockPagedLimit }));
	const mockPagedGroupBy = vi.fn(() => ({ orderBy: mockPagedOrderBy }));
	const mockPagedInnerJoin2 = vi.fn(() => ({ groupBy: mockPagedGroupBy }));
	const mockPagedInnerJoin1 = vi.fn(() => ({ innerJoin: mockPagedInnerJoin2 }));
	const mockPagedFrom = vi.fn(() => ({ innerJoin: mockPagedInnerJoin1 }));

	// Selections query terminal
	const mockSelOrderBy = vi.fn().mockResolvedValue([]);
	const mockSelWhere = vi.fn(() => ({ orderBy: mockSelOrderBy }));
	const mockSelInnerJoin2 = vi.fn(() => ({ where: mockSelWhere }));
	const mockSelInnerJoin1 = vi.fn(() => ({ innerJoin: mockSelInnerJoin2 }));
	const mockSelFrom = vi.fn(() => ({ innerJoin: mockSelInnerJoin1 }));

	// Photos query terminal
	const mockPhotoOrderBy = vi.fn().mockResolvedValue([]);
	const mockPhotoWhere = vi.fn(() => ({ orderBy: mockPhotoOrderBy }));
	const mockPhotoFrom = vi.fn(() => ({ where: mockPhotoWhere }));

	// Top-level select: routes each call to the right chain in order
	const mockSelect = vi.fn();

	return {
		mockQueryContestGroupFindFirst: vi.fn(),
		mockQueryAdminContestGroupFindFirst: vi.fn(),
		mockRequireAdminSession: vi.fn(),
		mockSelect,
		mockCountInnerJoin,
		mockCountFrom,
		mockPagedOffset,
		mockPagedLimit,
		mockPagedOrderBy,
		mockPagedGroupBy,
		mockPagedInnerJoin2,
		mockPagedInnerJoin1,
		mockPagedFrom,
		mockSelOrderBy,
		mockSelWhere,
		mockSelInnerJoin2,
		mockSelInnerJoin1,
		mockSelFrom,
		mockPhotoOrderBy,
		mockPhotoWhere,
		mockPhotoFrom
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
	countDistinct: (field: unknown) => ({ type: 'countDistinct', field }),
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (...args: unknown[]) => ({ type: 'eq', args }),
	inArray: (...args: unknown[]) => ({ type: 'inArray', args }),
	max: (field: unknown) => ({ type: 'max', field })
}));

import { load } from './+page.server';

// ---- helpers ----

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

/** Wire up mockSelect to route call 1 -> count chain, call 2 -> paged chain.
 *  Optionally call 3 -> selections chain, call 4 -> photos chain. */
function setupSelectChains({
	totalElectors = 0,
	pagedRows = [] as unknown[],
	selectionRows = [] as unknown[],
	photoRows = [] as unknown[]
} = {}) {
	// Wire up chain mocks (persistent default returns for each link in the chain)
	mockCountFrom.mockReturnValue({ innerJoin: mockCountInnerJoin });
	mockCountInnerJoin.mockResolvedValue([{ totalElectors }]);

	mockPagedFrom.mockReturnValue({ innerJoin: mockPagedInnerJoin1 });
	mockPagedInnerJoin1.mockReturnValue({ innerJoin: mockPagedInnerJoin2 });
	mockPagedInnerJoin2.mockReturnValue({ groupBy: mockPagedGroupBy });
	mockPagedGroupBy.mockReturnValue({ orderBy: mockPagedOrderBy });
	mockPagedOrderBy.mockReturnValue({ limit: mockPagedLimit });
	mockPagedLimit.mockReturnValue({ offset: mockPagedOffset });
	mockPagedOffset.mockResolvedValue(pagedRows);

	mockSelFrom.mockReturnValue({ innerJoin: mockSelInnerJoin1 });
	mockSelInnerJoin1.mockReturnValue({ innerJoin: mockSelInnerJoin2 });
	mockSelInnerJoin2.mockReturnValue({ where: mockSelWhere });
	mockSelWhere.mockReturnValue({ orderBy: mockSelOrderBy });
	mockSelOrderBy.mockResolvedValue(selectionRows);

	mockPhotoFrom.mockReturnValue({ where: mockPhotoWhere });
	mockPhotoWhere.mockReturnValue({ orderBy: mockPhotoOrderBy });
	mockPhotoOrderBy.mockResolvedValue(photoRows);

	// Reset mockSelect's once-queue before adding new entries so unconsumed
	// values from tests that threw early do not bleed into subsequent tests.
	mockSelect.mockReset();
	mockSelect
		.mockReturnValueOnce({ from: mockCountFrom }) // 1st call: count
		.mockReturnValueOnce({ from: mockPagedFrom }) // 2nd call: paged users
		.mockReturnValueOnce({ from: mockSelFrom }) // 3rd call: selections
		.mockReturnValueOnce({ from: mockPhotoFrom }); // 4th call: photos
}

// ---- test suite ----

describe('/admin/dashboard/contest-groups/electors/[contestGroupId]/+page.server.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupSelectChains();
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
		mockQueryAdminContestGroupFindFirst.mockResolvedValue({
			contestGroupId: 'test-group-id',
			adminId: 'admin-1'
		});

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

		const pagedRows = [
			{
				userId: 'user-1',
				firstName: 'Alice',
				lastName: 'Smith',
				username: 'asmith',
				lastVotedAt: new Date('2024-01-01T11:00:00Z')
			}
		];
		const selectionRows = [
			{
				userId: 'user-1',
				contestId: 'contest-1',
				contestTitle: 'Mayor',
				contestItemTitle: 'Candidate A'
			},
			{
				userId: 'user-1',
				contestId: 'contest-2',
				contestTitle: 'Council',
				contestItemTitle: 'Candidate B'
			}
		];

		setupSelectChains({ totalElectors: 1, pagedRows, selectionRows });

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

		const pagedRows = [
			{
				userId: 'user-1',
				firstName: 'Bob',
				lastName: 'Jones',
				username: 'bjones',
				lastVotedAt: new Date('2024-01-01T10:00:00Z')
			}
		];
		const selectionRows = [
			{
				userId: 'user-1',
				contestId: 'contest-1',
				contestTitle: 'Mayor',
				contestItemTitle: 'Candidate X'
			}
		];
		const photoRows = [
			{
				id: 'photo-1',
				userId: 'user-1',
				uploadedAt: new Date('2024-01-02T08:00:00Z')
			}
		];

		setupSelectChains({ totalElectors: 1, pagedRows, selectionRows, photoRows });

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

		// 15 total electors; page 2 has 5
		const pagedRows = Array.from({ length: 5 }, (_, i) => ({
			userId: `user-${i + 10}`,
			firstName: `First${i + 10}`,
			lastName: `Last${i + 10}`,
			username: `user${i + 10}`,
			lastVotedAt: new Date('2024-01-01T10:00:00Z')
		}));

		setupSelectChains({ totalElectors: 15, pagedRows });

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

		const pagedRows = Array.from({ length: 5 }, (_, i) => ({
			userId: `user-${i}`,
			firstName: `First${i}`,
			lastName: `Last${i}`,
			username: `user${i}`,
			lastVotedAt: new Date('2024-01-01T10:00:00Z')
		}));

		setupSelectChains({ totalElectors: 5, pagedRows });

		const result = await load({
			params: { contestGroupId: 'test-group-id' },
			locals: {},
			url: makeUrl('?page=99')
		} as never);

		expect(result.pagination.currentPage).toBe(1);
		expect(result.electors).toHaveLength(5);
	});
});
