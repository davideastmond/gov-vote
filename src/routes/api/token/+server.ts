import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { contest, contestGroup, user, voterCard, voterEligibility } from '$lib/server/db/schema';
import { signJWT, verifyJWT } from '$lib/server/utils/jwt/jwt';
import { tokenRequestValidator } from '$lib/validators/token-request.validator';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';
import z from 'zod';

export const POST: RequestHandler = async (event) => {
	// Validate the requestBody
	const requestBody = (await event.request.json()) as { voterCardCode: string };
	try {
		tokenRequestValidator.parse(requestBody);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.issues.map((issue) => {
				const path = issue.path.join('.');
				return `${path || 'Root'}: ${issue.message}`;
			});
			return json(
				{
					success: false,
					error: 'Bad Request',
					message: 'Invalid request data',
					details: errors
				},
				{ status: 400 }
			);
		}
	}

	// We get a voterIdCardCode. Check that it's valid and corresponds to a voter in the database. If so, generate a token for that voter and return it.
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
		.innerJoin(contestGroup, eq(contestGroup.id, voterCard.contestGroupId))
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

	// Grant token to the user if they are eligible to vote in at least one contest in the contest group.
	// We can determine this based on the eligibility data we just queried from the database.
	// If the user is eligible, we will generate a token
	// If the user is not eligible, we will return an error message.

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

	const jwtExpiry = env.JWT_EXPIRES_IN ? parseInt(env.JWT_EXPIRES_IN, 10) : 15; // Default to 15 minutes if not set

	// Token based on the voterCardCode
	const token = await signJWT({ sub: voterCardCode }, { exp: `${jwtExpiry}m` });
	const tokenMaxAge = jwtExpiry * 60; // Convert minutes to seconds

	const cookieOptions = {
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV !== 'development',
		maxAge: tokenMaxAge
	};

	event.cookies.set('voter_token', token, cookieOptions);

	return json({
		success: true,
		message: 'Token generated successfully'
	});
};
