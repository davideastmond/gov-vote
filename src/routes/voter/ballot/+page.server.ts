import { db } from '$lib/server/db';
import {
	contest,
	contestGroup,
	contestItem,
	user,
	voterCard,
	voterEligibility
} from '$lib/server/db/schema';
import { verifyJWT } from '$lib/server/utils/jwt/jwt';
import { redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { normalizeBallotRows } from './ballot-transform';

export const load: PageServerLoad = async (event) => {
	// We should be able to get cookies and jwt data from here
	const voterToken = event.cookies.get('voter_token');

	// If the voterToken is undefined, redirect to the voter/start page
	if (!voterToken) {
		return redirect(302, '/voter/start');
	}

	// Get the voterCodeCode from the JWT
	const { sub } = await verifyJWT<{ sub: string }>(voterToken);

	// If the sub is not defined, redirect to the voter/start page
	if (!sub) {
		return redirect(302, '/voter/start');
	}
	const ballotData = await db
		.select()
		.from(voterCard)
		.where(and(eq(voterCard.cardCode, sub), eq(voterCard.cardStatus, 'active')))
		.innerJoin(
			contestGroup,
			and(
				eq(contestGroup.id, voterCard.contestGroupId),
				eq(contestGroup.contestGroupStatus, 'active')
			)
		)
		.innerJoin(
			voterEligibility,
			and(
				eq(voterEligibility.contestGroupId, contestGroup.id),
				eq(voterEligibility.isEligible, true),
				eq(voterEligibility.isComplete, false)
			)
		)
		.innerJoin(user, eq(user.id, voterEligibility.userId))
		.innerJoin(
			contest,
			and(eq(contest.id, voterEligibility.contestId), eq(contest.contestStatus, 'active'))
		)
		.innerJoin(contestItem, eq(contestItem.contestId, contest.id));

	const contests = normalizeBallotRows(ballotData);

	return {
		contests
	};
};
