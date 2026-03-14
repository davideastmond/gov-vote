import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { extractValidationErrors } from '$lib/server/utils/extract-validation-errors';
import { checkAuthToken, getAuthTokenFromHeader } from '$lib/server/utils/header-request';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import z from 'zod';
import type { RequestHandler } from './$types';

/**
 * POST endpoint to seed a user
 * Requires Authorization: Bearer <token> header
 * Creates one user from request body; id is generated server-side
 */

const seedUserRequestValidator = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters long'),
	email: z.email('Email must be a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	role: z.enum(['admin', 'voter'], "Role must be either 'admin' or 'voter'")
});

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
			return json(
				{
					success: false,
					error: 'Bad Request',
					message: 'Request body must be valid JSON.'
				},
				{ status: 400 }
			);
		}

		let validatedPayload: z.infer<typeof seedUserRequestValidator>;
		try {
			validatedPayload = seedUserRequestValidator.parse(parsedBody);
		} catch (error) {
			return json(extractValidationErrors(error), { status: 400 });
		}

		const createdUserId = crypto.randomUUID();
		const hashedPassword = await bcrypt.hash(validatedPayload.password, 10);

		const createdUser = await db
			.insert(user)
			.values({
				id: createdUserId,
				email: validatedPayload.email,
				username: validatedPayload.username,
				hashedPassword,
				firstName: validatedPayload.firstName,
				lastName: validatedPayload.lastName,
				role: validatedPayload.role
			})
			.returning();

		const { hashedPassword: _hidden, ...safeUser } = createdUser[0];

		return json(
			{
				success: true,
				message: 'Successfully seeded user',
				data: {
					user: safeUser
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		if (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			(error as { code?: string }).code === '23505'
		) {
			return json(
				{
					success: false,
					error: 'Conflict',
					message: 'A user with that username or email already exists.'
				},
				{ status: 409 }
			);
		}

		console.error('Error seeding users:', error);

		return json(
			{
				success: false,
				error: 'Internal Server Error',
				message: 'Failed to seed user',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
