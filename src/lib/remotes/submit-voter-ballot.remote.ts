import { command, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { contest, voterCard, voterChoice, voterEligibility } from '$lib/server/db/schema';
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

		// The voterCardCode is stored in the JWT, so we need to get the JWT from the cookies and verify it to get the voterCardCode and userId for this ballot submission
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

		const voterCardEl = await db.query.voterCard.findFirst({
			where: (voterCard, { eq, and, or }) =>
				and(eq(voterCard.cardCode, voterCardCode), eq(voterCard.cardStatus, 'active'))
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
			)
			.innerJoin(
				contest,
				and(eq(contest.id, voterEligibility.contestId), eq(contest.contestStatus, 'active'))
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
				(eligibility) => eligibility.voter_eligibility.contestId === contestId
			);
			if (!matchingEligibilityRecord) {
				// This shouldn't happen.
				console.error(
					`No matching eligibility record found for contestId ${contestId} and voterCardCode ${voterCardCode}. This may indicate a potential security issue or a bug in the frontend code.`
				);
				return {
					success: false,
					errors: {
						contestId: `We cannot process the submission for this ballot`
					}
				};
				// In a production system, we might want to log this incident for further investigation, as it could indicate a potential security issue or a bug in the frontend code that's generating the ballot data.
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
					voterEligibilitiesForThisCard.map((rec) => rec.voter_eligibility.id)
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
