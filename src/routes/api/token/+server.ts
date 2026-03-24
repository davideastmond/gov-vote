import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { contest, contestGroup, user, voterCard, voterEligibility } from '$lib/server/db/schema';
import { createAuthenticatedApiHandler } from '$lib/server/utils/create-authenticated-api-handler';
import { signJWT, verifyJWT } from '$lib/server/utils/jwt/jwt';
import { tokenRequestValidator } from '$lib/validators/token-request.validator';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

export const POST: RequestHandler = createAuthenticatedApiHandler({
	requireAuth: false,
	validator: tokenRequestValidator,
	handler: async (requestBody: { voterCardCode: string }, event) => {
		// We get a voterIdCardCode. Check that it's valid and corresponds to a voter in the database.
		const { voterCardCode } = requestBody;
		const eligibilityData = await db
			.select()
			.from(voterCard)
			.where(
				and(
					eq(voterCard.cardCode, voterCardCode),
					or(eq(voterCard.cardStatus, 'active'), eq(voterCard.cardStatus, 'generated'))
				)
			)
			.innerJoin(
				contestGroup,
				and(
					eq(contestGroup.id, voterCard.contestGroupId),
					eq(contestGroup.contestGroupStatus, 'active')
				)
			)
			.innerJoin(
				contest,
				and(
					eq(contest.contestGroupId, contestGroup.id),
					or(eq(contest.contestStatus, 'upcoming'), eq(contest.contestStatus, 'active'))
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
			.innerJoin(user, eq(user.id, voterEligibility.userId));

		if (eligibilityData.length === 0) {
			return json({ success: false, message: 'Request denied' }, { status: 403 });
		}

		// Check if a token exists on the cookie
		const voterToken = event.cookies.get('voter_token');
		if (voterToken) {
			const { exp } = await verifyJWT<{ exp: number }>(voterToken as string);
			const currentTime = Math.floor(Date.now() / 1000);
			if (currentTime < exp) {
				return json({ success: true }, { status: 200 });
			}
		}

		const jwtExpiry = env.JWT_EXPIRES_IN ? parseInt(env.JWT_EXPIRES_IN, 10) : 15;
		const token = await signJWT({ sub: voterCardCode }, { exp: `${jwtExpiry}m` });
		const tokenMaxAge = jwtExpiry * 60;

		event.cookies.set('voter_token', token, {
			httpOnly: true,
			path: '/',
			secure: process.env.NODE_ENV !== 'development',
			maxAge: tokenMaxAge
		});

		return json({
			success: true,
			message: 'Token generated successfully'
		});
	}
});
