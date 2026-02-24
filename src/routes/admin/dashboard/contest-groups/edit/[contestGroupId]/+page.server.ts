import { db } from '$lib/server/db';
import { contest, contestGroup, contestItem } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

async function assertAdmin(locals: App.Locals) {
	const session = await locals.auth();
	if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
		throw redirect(302, '/admin/login');
	}
}

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

export const load: PageServerLoad = async ({ params, locals }) => {
	await assertAdmin(locals);

	const group = await db.query.contestGroup.findFirst({
		where: (cg, { eq }) => eq(cg.id, params.contestGroupId)
	});

	if (!group) {
		throw error(404, 'Contest group not found');
	}

	const contests = await db
		.select({
			id: contest.id,
			title: contest.title,
			description: contest.description,
			contestStatus: contest.contestStatus,
			createdAt: contest.createdAt
		})
		.from(contest)
		.where(eq(contest.contestGroupId, params.contestGroupId));

	const allItems = await db
		.select({
			id: contestItem.id,
			contestId: contestItem.contestId,
			title: contestItem.title,
			auxiliaryText: contestItem.auxiliaryText,
			contestItemType: contestItem.contestItemType
		})
		.from(contestItem)
		.innerJoin(contest, eq(contest.id, contestItem.contestId))
		.where(eq(contest.contestGroupId, params.contestGroupId));

	const contestsWithItems = contests.map((contestEl) => ({
		...contestEl,
		items: allItems.filter((item) => item.contestId === contestEl.id)
	}));

	return {
		contestGroup: group,
		contests: contestsWithItems
	};
};

export const actions: Actions = {
	updateGroupDetails: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const title = getString(formData, 'title');
		const description = getString(formData, 'description');

		if (!title) {
			return fail(400, {
				action: 'updateGroupDetails',
				success: false,
				message: 'Title is required.'
			});
		}

		await db
			.update(contestGroup)
			.set({
				title,
				description,
				updatedAt: new Date()
			})
			.where(eq(contestGroup.id, params.contestGroupId));

		return {
			action: 'updateGroupDetails',
			success: true,
			message: 'Contest group details updated.'
		};
	},

	deactivateGroup: async ({ params, locals }) => {
		await assertAdmin(locals);

		await db
			.update(contest)
			.set({
				contestStatus: 'closed',
				updatedAt: new Date()
			})
			.where(eq(contest.contestGroupId, params.contestGroupId));

		return {
			action: 'deactivateGroup',
			success: true,
			message: 'Contest group deactivated. All contests are now inactive (closed).'
		};
	},

	deactivateContest: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');

		if (!contestId) {
			return fail(400, {
				action: 'deactivateContest',
				success: false,
				message: 'Contest id is required.'
			});
		}

		await db
			.update(contest)
			.set({ contestStatus: 'closed', updatedAt: new Date() })
			.where(and(eq(contest.id, contestId), eq(contest.contestGroupId, params.contestGroupId)));

		return {
			action: 'deactivateContest',
			success: true,
			message: 'Contest deactivated.'
		};
	},

	addContest: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const title = getString(formData, 'title');
		const description = getString(formData, 'description');

		if (!title) {
			return fail(400, {
				action: 'addContest',
				success: false,
				message: 'Contest title is required.'
			});
		}

		await db.insert(contest).values({
			id: crypto.randomUUID(),
			contestGroupId: params.contestGroupId,
			title,
			description,
			contestStatus: 'upcoming'
		});

		return {
			action: 'addContest',
			success: true,
			message: 'Contest added to group.'
		};
	},

	renameContest: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');
		const title = getString(formData, 'title');
		const description = getString(formData, 'description');

		if (!contestId || !title) {
			return fail(400, {
				action: 'renameContest',
				success: false,
				message: 'Contest id and title are required.'
			});
		}

		await db
			.update(contest)
			.set({ title, description, updatedAt: new Date() })
			.where(and(eq(contest.id, contestId), eq(contest.contestGroupId, params.contestGroupId)));

		return {
			action: 'renameContest',
			success: true,
			message: 'Contest updated.'
		};
	},

	updateContestItem: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');
		const contestItemId = getString(formData, 'contestItemId');
		const title = getString(formData, 'title');
		const auxiliaryText = getString(formData, 'auxiliaryText');
		const contestItemType = getString(formData, 'contestItemType');

		if (!contestId || !contestItemId || !title || !contestItemType) {
			return fail(400, {
				action: 'updateContestItem',
				success: false,
				message: 'Contest, item, title, and item type are required.'
			});
		}

		if (!['candidate', 'initiative', 'other'].includes(contestItemType)) {
			return fail(400, {
				action: 'updateContestItem',
				success: false,
				message: 'Invalid contest item type.'
			});
		}

		const parentContest = await db.query.contest.findFirst({
			where: (contestEl, { and, eq }) =>
				and(eq(contestEl.id, contestId), eq(contestEl.contestGroupId, params.contestGroupId))
		});

		if (!parentContest) {
			return fail(404, {
				action: 'updateContestItem',
				success: false,
				message: 'Contest not found.'
			});
		}

		await db
			.update(contestItem)
			.set({
				title,
				auxiliaryText,
				contestItemType: contestItemType as 'candidate' | 'initiative' | 'other',
				updatedAt: new Date()
			})
			.where(and(eq(contestItem.id, contestItemId), eq(contestItem.contestId, contestId)));

		return {
			action: 'updateContestItem',
			success: true,
			message: 'Contest item updated.'
		};
	},

	addContestItem: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');
		const title = getString(formData, 'title');
		const auxiliaryText = getString(formData, 'auxiliaryText');
		const contestItemType = getString(formData, 'contestItemType');

		if (!contestId || !title || !contestItemType) {
			return fail(400, {
				action: 'addContestItem',
				success: false,
				message: 'Contest, item title, and item type are required.'
			});
		}

		if (!['candidate', 'initiative', 'other'].includes(contestItemType)) {
			return fail(400, {
				action: 'addContestItem',
				success: false,
				message: 'Invalid contest item type.'
			});
		}

		const parentContest = await db.query.contest.findFirst({
			where: (contestEl, { and, eq }) =>
				and(eq(contestEl.id, contestId), eq(contestEl.contestGroupId, params.contestGroupId))
		});

		if (!parentContest) {
			return fail(404, {
				action: 'addContestItem',
				success: false,
				message: 'Contest not found.'
			});
		}

		await db.insert(contestItem).values({
			id: crypto.randomUUID(),
			contestId,
			title,
			auxiliaryText,
			contestItemType: contestItemType as 'candidate' | 'initiative' | 'other'
		});

		return {
			action: 'addContestItem',
			success: true,
			message: 'Contest item added.'
		};
	},

	deleteContestItem: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');
		const contestItemId = getString(formData, 'contestItemId');

		if (!contestId || !contestItemId) {
			return fail(400, {
				action: 'deleteContestItem',
				success: false,
				message: 'Contest and item ids are required.'
			});
		}

		const parentContest = await db.query.contest.findFirst({
			where: (contestEl, { and, eq }) =>
				and(eq(contestEl.id, contestId), eq(contestEl.contestGroupId, params.contestGroupId))
		});

		if (!parentContest) {
			return fail(404, {
				action: 'deleteContestItem',
				success: false,
				message: 'Contest not found.'
			});
		}

		await db
			.delete(contestItem)
			.where(and(eq(contestItem.id, contestItemId), eq(contestItem.contestId, contestId)));

		return {
			action: 'deleteContestItem',
			success: true,
			message: 'Contest item deleted.'
		};
	}
};
