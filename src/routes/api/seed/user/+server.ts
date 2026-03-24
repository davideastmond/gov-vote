import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { apiBadRequest, apiInternalError } from '$lib/server/utils/api-response-helpers';
import { extractValidationErrors } from '$lib/server/utils/extract-validation-errors';
import { checkAuthToken, getAuthTokenFromHeader } from '$lib/server/utils/header-request';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import z from 'zod';
import type { RequestHandler } from './$types';

/**
 * POST endpoint to seed users
 * Requires Authorization: Bearer <token> header
 * Creates users from request body array; id is generated server-side
 */

const seedUserRequestValidator = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters long'),
	email: z.email('Email must be a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	role: z.enum(['admin', 'voter'], "Role must be either 'admin' or 'voter'")
});

const seedUsersRequestValidator = z
	.array(seedUserRequestValidator)
	.min(1, 'At least one user is required');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const token = getAuthTokenFromHeader(request);

		if (!checkAuthToken(token as string)) {
			return json(
				{
					error: 'Forbidden',
					message: 'Invalid authentication token'
				},
				{ status: 403 }
			);
		}

		let parsedBody: unknown;
		try {
			parsedBody = await request.json();
		} catch {
			return apiBadRequest();
		}

		let validatedPayload: z.infer<typeof seedUsersRequestValidator>;
		try {
			validatedPayload = seedUsersRequestValidator.parse(parsedBody);
		} catch (error) {
			return json(extractValidationErrors(error), { status: 400 });
		}

		const usersToCreate = await Promise.all(
			validatedPayload.map(async (entry) => ({
				id: crypto.randomUUID(),
				email: entry.email,
				username: entry.username,
				hashedPassword: await bcrypt.hash(entry.password, 10),
				firstName: entry.firstName,
				lastName: entry.lastName,
				role: entry.role
			}))
		);

		const createdUsers = await db.insert(user).values(usersToCreate).returning();

		const safeUsers = createdUsers.map(({ hashedPassword: _hidden, ...safeUser }) => safeUser);

		return json(
			{
				success: true,
				message: 'Successfully seeded users',
				data: {
					users: safeUsers
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error seeding users:', error);
		return apiInternalError(
			'Failed to seed users',
			error instanceof Error ? error.message : 'Unknown error'
		);
	}
};
