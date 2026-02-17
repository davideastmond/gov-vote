import { db } from '$lib/server/db';
import {
	address,
	contest,
	contestGroup,
	contestGroupPollingStation,
	contestItem,
	pollingStation
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

// Loads a specific contest group by ID, along with its associated contests and polling stations, for display on the contest group details page in the admin dashboard.

export const load: PageServerLoad = async ({ params }) => {
	const { contestGroupId } = params;
	console.log('Loading contest group with ID:', contestGroupId);

	// Contest group details - title and description and polling locations
	const contestGroupBasics = await db
		.select({
			contestGroupId: contestGroup.id,
			contestGroupTitle: contestGroup.title,
			contestGroupDescription: contestGroup.description,
			pollingStationId: pollingStation.id,
			pollingStationName: pollingStation.name,
			pollingStationStreetAddress: address.streetAddress,
			pollingStationCity: address.city,
			pollingStationState: address.state,
			pollingStationZipCode: address.zipCode
		})
		.from(contestGroup)
		.where(eq(contestGroup.id, contestGroupId))
		.innerJoin(
			contestGroupPollingStation,
			eq(contestGroupPollingStation.contestGroupId, contestGroup.id)
		)
		.innerJoin(pollingStation, eq(pollingStation.id, contestGroupPollingStation.pollingStationId))
		.innerJoin(address, eq(address.id, pollingStation.addressId));

	const ballotContests = await db
		.select({
			contestTitle: contest.title,
			contestDescription: contest.description,
			contestItemId: contestItem.id,
			contestItemTitle: contestItem.title,
			contestItemAuxiliaryText: contestItem.auxiliaryText,
			contestItemType: contestItem.contestItemType
		})
		.from(contestGroup)
		.where(eq(contestGroup.id, contestGroupId))
		.innerJoin(contest, eq(contest.contestGroupId, contestGroup.id))
		.innerJoin(contestItem, eq(contestItem.contestId, contest.id));

	return {
		contestGroupBasics: contestGroupBasics,
		ballotContests: ballotContests
	};
};
