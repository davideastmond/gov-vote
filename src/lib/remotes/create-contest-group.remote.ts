import { command } from '$app/server';
import type { PollingStationAddress } from '$lib/definitions/address';
import type { Contest, ContestItemType } from '$lib/definitions/contest-group';
import { db } from '$lib/server/db';
import {
	address,
	adminContestGroup,
	contest,
	contestGroup,
	contestGroupPollingStation,
	contestItem,
	pollingStation
} from '$lib/server/db/schema';
import { createContestGroupValidator } from '$lib/validators/create-contest-group.validator';
import z from 'zod';

type InputData = {
	id: string;
	title: string;
	description: string;
	adminIds: string[];
	contests: Contest[];
	pollingStationAddresses: PollingStationAddress[];
};
export const createContestGroup = command(
	'unchecked',
	async (
		data: InputData
	): Promise<{ errors: Record<string, string> } | { contestGroupId: string } | void> => {
		// Validate the incoming data using the createContestGroupValidator
		try {
			createContestGroupValidator.parse(data);
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error('Validation error:', error.issues);
				const errors: Record<string, string> = {};
				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						errors[issue.path[0] as string] = issue.message;
					}
				});
				return { errors };
			}
		}

		const { id, title, description, adminIds, contests, pollingStationAddresses } = data;
		// Create the contest group.
		try {
			const newContestGroup = await db
				.insert(contestGroup)
				.values({
					id: id,
					title,
					description
				})
				.returning({ id: contestGroup.id });

			await writeContestDataToDb(newContestGroup[0].id, contests);
			// Associate the admins with the contest group via the join table
			if (adminIds && adminIds.length > 0) {
				await writeAdminContestsDataToDb(newContestGroup[0].id, adminIds);
			}

			await writePollingStationDataToDb(newContestGroup[0].id, pollingStationAddresses);
			return { contestGroupId: newContestGroup[0].id };
		} catch (error) {
			console.error(error);
		}
	}
);

async function writeContestDataToDb(contestGroupId: string, contests: Contest[]) {
	// Create contests and contest items - they are nested
	const extractedContestsData: {
		id: string;
		contestGroupId: string;
		title: string;
		description?: string;
	}[] = [];
	const extractedContestItemsData: {
		id: string;
		contestId: string;
		title: string;
		auxiliaryText: string;
		contestItemType: ContestItemType;
	}[] = [];

	contests.forEach((contest) => {
		extractedContestsData.push({
			id: contest.id,
			contestGroupId: contestGroupId,
			title: contest.title,
			description: contest.description
		});

		contest.items.forEach((item) => {
			extractedContestItemsData.push({
				id: item.id,
				contestId: contest.id,
				title: item.title,
				auxiliaryText: item.auxiliaryText,
				contestItemType: item.contestItemType
			});
		});
	});

	await db.insert(contest).values(extractedContestsData);
	await db.insert(contestItem).values(extractedContestItemsData);
}

async function writeAdminContestsDataToDb(contestGroupId: string, adminIds: string[]) {
	const mappedAdminContestGroupData = adminIds.map((adminId) => {
		return {
			id: crypto.randomUUID(), // For the database primary key in the join table
			adminId: adminId,
			contestGroupId: contestGroupId
		};
	});
	await db.insert(adminContestGroup).values(mappedAdminContestGroupData);
}

async function writePollingStationDataToDb(
	contestGroupId: string,
	pollingStationAddresses: PollingStationAddress[]
) {
	// TBD: Implement this function to write polling station data to the database and associate it with the contest group
	/* - address, pollingStation, contestGroupPollingStation */
	// 1. Write the address data.

	for await (const a of pollingStationAddresses) {
		const addressId = crypto.randomUUID();
		await db.insert(address).values({
			id: addressId,
			streetAddress: a.streetAddress,
			city: a.city,
			state: a.state,
			zipCode: a.zipCode
		});
		// 2. Write the polling station data, associating it with the address
		const pollingStationId = crypto.randomUUID();
		await db.insert(pollingStation).values({
			id: pollingStationId,
			name: a.name,
			addressId: addressId
		});
		// 3. Associate the polling station with the contest group via the join table
		await db.insert(contestGroupPollingStation).values({
			id: crypto.randomUUID(),
			contestGroupId: contestGroupId,
			pollingStationId: pollingStationId
		});
		console.log('Inserted polling station with ID:', pollingStationId);
	}
}
