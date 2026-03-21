import type { ContestItemType, ContestStatus } from '$lib/definitions/enums';
import { db } from '$lib/server/db';
import {
	address,
	contest,
	contestGroup,
	contestGroupPollingStation,
	contestItem,
	pollingStation
} from '$lib/server/db/schema';
import { findAddressByComponents } from '$lib/server/utils/find-address-by-components';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

async function assertAdmin(locals: App.Locals) {
	await requireAdminSession(locals);
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

	const pollingStations = await db
		.select({
			associationId: contestGroupPollingStation.id,
			id: pollingStation.id,
			name: pollingStation.name,
			streetAddress: address.streetAddress,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			createdAt: pollingStation.createdAt
		})
		.from(contestGroupPollingStation)
		.innerJoin(pollingStation, eq(pollingStation.id, contestGroupPollingStation.pollingStationId))
		.innerJoin(address, eq(address.id, pollingStation.addressId))
		.where(eq(contestGroupPollingStation.contestGroupId, params.contestGroupId));

	return {
		contestGroup: group,
		contests: contestsWithItems,
		pollingStations
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

	updateGroupStatus: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestGroupStatus = getString(formData, 'contestGroupStatus');

		if (!['upcoming', 'active', 'closed'].includes(contestGroupStatus)) {
			return fail(400, {
				action: 'updateGroupStatus',
				success: false,
				message: 'Invalid contest group status.'
			});
		}

		await db
			.update(contestGroup)
			.set({
				contestGroupStatus: contestGroupStatus as ContestStatus,
				updatedAt: new Date()
			})
			.where(eq(contestGroup.id, params.contestGroupId));

		return {
			action: 'updateGroupStatus',
			success: true,
			message: 'Contest group status updated.'
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

		await db
			.update(contestGroup)
			.set({
				contestGroupStatus: 'closed',
				updatedAt: new Date()
			})
			.where(eq(contestGroup.id, params.contestGroupId));

		return {
			action: 'deactivateGroup',
			success: true,
			message: 'Contest group deactivated. All contests are now inactive (closed).'
		};
	},

	updateContestStatus: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const contestId = getString(formData, 'contestId');
		const contestStatus = getString(formData, 'contestStatus');

		if (!contestId || !contestStatus) {
			return fail(400, {
				action: 'updateContestStatus',
				success: false,
				message: 'Contest id and status are required.'
			});
		}

		if (!['upcoming', 'active', 'closed'].includes(contestStatus)) {
			return fail(400, {
				action: 'updateContestStatus',
				success: false,
				message: 'Invalid contest status.'
			});
		}

		await db
			.update(contest)
			.set({
				contestStatus: contestStatus as ContestStatus,
				updatedAt: new Date()
			})
			.where(and(eq(contest.id, contestId), eq(contest.contestGroupId, params.contestGroupId)));

		return {
			action: 'updateContestStatus',
			success: true,
			message: 'Contest status updated.'
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

	addPollingStation: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const name = getString(formData, 'name');
		const streetAddress = getString(formData, 'streetAddress');
		const city = getString(formData, 'city');
		const state = getString(formData, 'state');
		const zipCode = getString(formData, 'zipCode');

		if (!name || !streetAddress || !city || !state || !zipCode) {
			return fail(400, {
				action: 'addPollingStation',
				success: false,
				message: 'Polling station name and full address are required.'
			});
		}

		const foundAddress = await findAddressByComponents({
			streetAddress,
			city,
			state,
			zipCode
		});

		const addressId = foundAddress?.id ?? crypto.randomUUID();

		if (!foundAddress) {
			await db.insert(address).values({
				id: addressId,
				streetAddress,
				city,
				state,
				zipCode
			});
		}

		const foundPollingStation = await db.query.pollingStation.findFirst({
			where: (ps, { and, eq }) => and(eq(ps.addressId, addressId), eq(ps.name, name))
		});

		const pollingStationId = foundPollingStation?.id ?? crypto.randomUUID();

		if (!foundPollingStation) {
			await db.insert(pollingStation).values({
				id: pollingStationId,
				name,
				addressId
			});
		}

		const existingAssociation = await db.query.contestGroupPollingStation.findFirst({
			where: (association, { and, eq }) =>
				and(
					eq(association.contestGroupId, params.contestGroupId),
					eq(association.pollingStationId, pollingStationId)
				)
		});

		if (existingAssociation) {
			return {
				action: 'addPollingStation',
				success: true,
				message: 'Polling station is already associated with this contest group.'
			};
		}

		await db.insert(contestGroupPollingStation).values({
			id: crypto.randomUUID(),
			contestGroupId: params.contestGroupId,
			pollingStationId
		});

		return {
			action: 'addPollingStation',
			success: true,
			message: 'Polling station added to contest group.'
		};
	},

	deletePollingStation: async ({ request, params, locals }) => {
		await assertAdmin(locals);

		const formData = await request.formData();
		const associationId = getString(formData, 'associationId');

		if (!associationId) {
			return fail(400, {
				action: 'deletePollingStation',
				success: false,
				message: 'Polling station association id is required.'
			});
		}

		await db
			.delete(contestGroupPollingStation)
			.where(
				and(
					eq(contestGroupPollingStation.id, associationId),
					eq(contestGroupPollingStation.contestGroupId, params.contestGroupId)
				)
			);

		return {
			action: 'deletePollingStation',
			success: true,
			message: 'Polling station removed from contest group.'
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
				contestItemType: contestItemType as ContestItemType,
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
			contestItemType: contestItemType as ContestItemType
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
