import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { voterCard, voterChoice, voterEligibility } from '$lib/server/db/schema';
import { verifyJWT } from '$lib/server/utils/jwt/jwt';
import { submittedBallotValidator } from '$lib/validators/submitted-ballet.validator';
import { and, eq, inArray } from 'drizzle-orm';

import z from 'zod';

export const submitVoterBallot = command(
	'unchecked',
	async (
		ballotData: Record<string, string[]>
	): Promise<{ success: boolean; errors?: Record<string, string> }> => {
		try {
			submittedBallotValidator.parse(ballotData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errors: Record<string, string> = {};
				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						errors[issue.path[0] as string] = issue.message;
					}
				});
				return { success: false, errors };
			}
		}
		const { cookies } = getRequestEvent();
		const voterToken = cookies.get('voter_token');
		if (!voterToken) {
			return {
				success: false,
				errors: { voterToken: 'Unauthorized request: missing token credentials' }
			};
		}

		let voterCardCode: string;
		try {
			const { sub } = await verifyJWT<{ sub: string }>(voterToken);
			voterCardCode = sub;
		} catch (error) {
			return {
				success: false,
				errors: { voterToken: 'Unauthorized request: invalid token credentials' }
			};
		}
		// I need to access the voterToken from the cookies to identify which voter is submitting the ballot.
		const voterCardEl = await db.query.voterCard.findFirst({
			where: (voterCard, { eq, and, or }) =>
				and(
					eq(voterCard.cardCode, voterCardCode),
					or(eq(voterCard.cardStatus, 'active'), eq(voterCard.cardStatus, 'generated'))
				)
		});
		if (!voterCardEl) {
			return {
				success: false,
				errors: {
					voterCard:
						'Invalid voter card and/or voter card status. Please check your elections administrator.'
				}
			};
		}

		// Find eligibility record for this voter, associated with the card and contest group
		const voterEligibilitiesForThisCard = await db
			.select()
			.from(voterEligibility)
			.where(
				and(
					eq(voterEligibility.contestGroupId, voterCardEl.contestGroupId),
					eq(voterEligibility.userId, voterCardEl.userId),
					eq(voterEligibility.isEligible, true),
					eq(voterEligibility.isComplete, false)
				)
			);

		for await (const rec of Object.entries(ballotData)) {
			const contestId = rec[0];
			const selectedContestItemIds = rec[1];
			console.log(
				'Processing ballot submission for contestId:',
				contestId,
				'with selected items:',
				selectedContestItemIds
			);

			// Sanity and security check - it may not be necessary
			const matchingEligibilityRecord = voterEligibilitiesForThisCard.find(
				(eligibility) => eligibility.contestId === contestId
			);
			if (!matchingEligibilityRecord) {
				// This shouldn't happen.
				throw new Error(
					`No matching eligibility record found for contestId ${contestId} and user ${voterCardEl.userId}. Skipping this contest.`
				);
			}
			for await (const selectedItemId of selectedContestItemIds) {
				// Write a voterChoice
				await db.insert(voterChoice).values({
					id: crypto.randomUUID(),
					contestId: contestId,
					contestItemId: selectedItemId,
					userId: voterCardEl.userId
				});
			}
		}

		// Mark the eligibility records as complete
		await db
			.update(voterEligibility)
			.set({ isComplete: true })
			.where(
				inArray(
					voterEligibility.id,
					voterEligibilitiesForThisCard.map((rec) => rec.id)
				)
			);

		// Mark the voterCard as inactive
		await db
			.update(voterCard)
			.set({ cardStatus: 'inactive' })
			.where(eq(voterCard.id, voterCardEl.id));
		return { success: true };
	}
);
