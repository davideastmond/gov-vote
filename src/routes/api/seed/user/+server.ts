import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { checkAuthToken, getAuthTokenFromHeader } from '$lib/server/utils/header-request';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import type { RequestHandler } from './$types';

/**
 * POST endpoint to seed admin and voter users
 * Requires Authorization: Bearer <token> header
 * Creates one admin user and one voter user with sample data
 */
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

		// Generate unique IDs for users
		const adminId = crypto.randomUUID();
		const superAdminId = crypto.randomUUID();
		const voterId = crypto.randomUUID();

		const adminPassword = bcrypt.hashSync('adminpassword', 10); // Hash the admin password
		const voterPassword = bcrypt.hashSync('voterpassword', 10); // Hash the voter password
		const superAdminPassword = bcrypt.hashSync('superadminpassword', 10); // Hash the super admin password

		// Create admin user
		const adminUser = await db
			.insert(user)
			.values({
				id: adminId,
				email: 'admin@example.com',
				username: 'admin',
				hashedPassword: adminPassword,
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
				email: 'voter@example.com',
				username: 'voter',
				hashedPassword: voterPassword,
				firstName: 'Sample',
				lastName: 'Voter',
				role: 'voter'
			})
			.returning();

		// Create super admin user
		const superAdminUser = await db
			.insert(user)
			.values({
				id: superAdminId,
				email: 'superadmin@example.com',
				username: 'superadmin',
				hashedPassword: superAdminPassword,
				firstName: 'Super',
				lastName: 'Admin',
				role: 'super_admin'
			})
			.returning();

		return json(
			{
				success: true,
				message: 'Successfully seeded admin, super admin, and voter users',
				data: {
					admin: adminUser[0],
					superAdmin: superAdminUser[0],
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
