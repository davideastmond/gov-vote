// Using SvelteKits experimental server actions to create a new admin user

import { command } from '$app/server';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { extractValidationErrorsObject } from '$lib/server/utils/extract-validation-errors';
import { createAdminValidator } from '$lib/validators/create-admin.validator';
import bcrypt from 'bcrypt';
type CreateAdminData = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	username: string;
};
export const createAdminUser = command(
	'unchecked',
	async (data: CreateAdminData): Promise<{ errors: Record<string, string> } | void> => {
		// use zod to validate the incoming data
		try {
			createAdminValidator.parse(data);
		} catch (error) {
			return extractValidationErrorsObject(error);
		}

		// Make sure an admin user with the same email or username doesn't already exist
		const existingAdmin = await db.query.user.findFirst({
			where: (user, { or, eq }) => or(eq(user.email, data.email), eq(user.username, data.username))
		});

		if (existingAdmin) {
			console.error(
				'Admin user with this email or username already exists:',
				data.email,
				data.username
			);
			return {
				errors: {
					email: 'Operation failed: unable to create admin.'
				}
			};
		}
		const hashedPassword = await bcrypt.hash(data.password, 10);
		try {
			await db.insert(user).values({
				id: crypto.randomUUID(),
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				hashedPassword,
				username: data.username,
				role: 'admin'
			});
		} catch (error) {
			console.error('Error creating admin user:', error);
			const errors: Record<string, string> = {
				password: 'Failed to create admin user. Please try again.'
			};
			return { errors };
		}
	}
);
