import { db } from '$lib/server/db';
import {
	address,
	adminContestGroup,
	contest,
	contestGroup,
	contestGroupPollingStation,
	contestItem,
	pollingStation,
	user,
	userAddress,
	voterCard,
	voterEligibility
} from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import {
	normalizeVoterCardDetailRows,
	type VoterCardDetailRow
} from '$lib/server/utils/voter-card';
import type { AggregatedContestDetails } from '$lib/utils/voter-card';
import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { Actions, PageServerLoad } from './$types';

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await requireAdminSession(locals);
	const adminId = session.user.id as string;
	const pollingStationAddress = alias(address, 'polling_station_address');
	const rows = await db
		.select({
			id: voterCard.id,
			cardNumber: voterCard.cardCode,
			status: voterCard.cardStatus,
			firstName: user.firstName,
			lastName: user.lastName,
			streetAddress: address.streetAddress,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			contestGroupId: contestGroup.id,
			contestGroupName: contestGroup.title,
			createdAt: voterCard.createdAt,
			updatedAt: voterCard.updatedAt,
			pollingStationName: pollingStation.name,
			pollingStationStreet: pollingStationAddress.streetAddress,
			pollingStationCity: pollingStationAddress.city,
			pollingStationState: pollingStationAddress.state,
			pollingStationZip: pollingStationAddress.zipCode
		})
		.from(voterCard)
		.innerJoin(user, eq(user.id, voterCard.userId))
		.innerJoin(contestGroup, eq(contestGroup.id, voterCard.contestGroupId))

		.innerJoin(
			contestGroupPollingStation,
			eq(contestGroupPollingStation.contestGroupId, contestGroup.id)
		)
		.innerJoin(pollingStation, eq(pollingStation.id, contestGroupPollingStation.pollingStationId))
		.innerJoin(pollingStationAddress, eq(pollingStation.addressId, pollingStationAddress.id))
		.leftJoin(userAddress, eq(userAddress.userId, user.id))
		.leftJoin(address, eq(address.id, userAddress.addressId))
		.leftJoin(
			adminContestGroup,
			and(
				eq(adminContestGroup.contestGroupId, contestGroup.id),
				eq(adminContestGroup.adminId, adminId)
			)
		)
		.where(eq(voterCard.id, params.voterCardId));

	const voterCardDetails = normalizeVoterCardDetailRows(rows as VoterCardDetailRow[]);

	if (!voterCardDetails) {
		throw error(404, 'Voter card not found');
	}

	const eligibleContests = await db
		.select({
			id: contest.id,
			title: contest.title,
			description: contest.description,
			status: contest.contestStatus,
			contestItemId: contestItem.id,
			contestItemTitle: contestItem.title,
			contestItemAuxiliaryText: contestItem.auxiliaryText,
			contestItemType: contestItem.contestItemType
		})
		.from(voterCard)
		.innerJoin(
			voterEligibility,
			and(
				eq(voterEligibility.userId, voterCard.userId),
				eq(voterEligibility.contestGroupId, voterCard.contestGroupId),
				eq(voterEligibility.isEligible, true)
			)
		)
		.innerJoin(contest, eq(contest.id, voterEligibility.contestId))
		.leftJoin(contestItem, eq(contestItem.contestId, contest.id))
		.where(eq(voterCard.id, params.voterCardId));

	return {
		voterCard: voterCardDetails,
		eligibleContests: eligibleContests as AggregatedContestDetails[]
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, params, locals }) => {
		const session = await requireAdminSession(locals);
		const adminId = session.user.id as string;

		const formData = await request.formData();
		const cardStatus = getString(formData, 'cardStatus');

		if (!['generated', 'active', 'inactive'].includes(cardStatus)) {
			return fail(400, {
				action: 'updateStatus',
				success: false,
				message: 'Invalid voter card status.'
			});
		}

		if (session.user.role === 'admin') {
			const adminAccess = await db
				.select({ id: voterCard.id })
				.from(voterCard)
				.innerJoin(contestGroup, eq(contestGroup.id, voterCard.contestGroupId))
				.innerJoin(
					adminContestGroup,
					and(
						eq(adminContestGroup.contestGroupId, contestGroup.id),
						eq(adminContestGroup.adminId, adminId)
					)
				)
				.where(eq(voterCard.id, params.voterCardId));

			if (!adminAccess.length) {
				throw error(404, 'Voter card not found');
			}
		}

		await db
			.update(voterCard)
			.set({
				cardStatus: cardStatus as 'generated' | 'active' | 'inactive',
				updatedAt: new Date()
			})
			.where(eq(voterCard.id, params.voterCardId));

		return {
			action: 'updateStatus',
			success: true,
			message: 'Voter card status updated.'
		};
	}
};
