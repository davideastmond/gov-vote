import { command } from '$app/server';
import type { PollingStationAddress } from '$lib/definitions/address';
import type { Contest } from '$lib/definitions/contest-group';
import { db } from '$lib/server/db';
import { contestGroup } from '$lib/server/db/schema';
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
	async (data: InputData): Promise<{ errors: Record<string, string> } | void> => {
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

			// Associate the admins with the contest group.
		} catch (error) {
			console.error(error);
		}
	}
);
