import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST endpoint to seed admin and voter users
 * Requires Authorization: Bearer <token> header
 * Creates one admin user and one voter user with sample data
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		// Check for Authorization header
		const authHeader = request.headers.get('Authorization');

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json(
				{
					error: 'Unauthorized',
					message: 'Missing or invalid Authorization header. Expected format: Bearer <token>'
				},
				{ status: 401 }
			);
		}

		// Extract token from header
		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		// Validate token against environment variable
		const expectedToken = env.SEED_AUTH_TOKEN;

		if (!expectedToken) {
			console.error('SEED_AUTH_TOKEN is not configured in environment variables');
			return json(
				{
					error: 'Server Configuration Error',
					message: 'Seed endpoint is not properly configured'
				},
				{ status: 500 }
			);
		}

		if (token !== expectedToken) {
			return json(
				{
					error: 'Forbidden',
					message: 'Invalid authentication token'
				},
				{ status: 403 }
			);
		}

		// Generate unique IDs for users
		const adminId = crypto.randomUUID();
		const voterId = crypto.randomUUID();

		// Create admin user
		const adminUser = await db
			.insert(user)
			.values({
				id: adminId,
				firstName: 'Admin',
				lastName: 'User',
				role: 'admin'
			})
			.returning();

		// Create voter user
		const voterUser = await db
			.insert(user)
			.values({
				id: voterId,
				firstName: 'Sample',
				lastName: 'Voter',
				role: 'voter'
			})
			.returning();

		return json(
			{
				success: true,
				message: 'Successfully seeded admin and voter users',
				data: {
					admin: adminUser[0],
					voter: voterUser[0]
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error seeding users:', error);

		return json(
			{
				error: 'Internal Server Error',
				message: 'Failed to seed users',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
