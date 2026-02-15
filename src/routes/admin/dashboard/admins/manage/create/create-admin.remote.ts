// Using SvelteKits experimental server actions to create a new admin user

import { command } from '$app/server';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { createAdminValidator } from '$lib/validators/create-admin.validator';
import bcrypt from 'bcrypt';
import { z } from 'zod';
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
			if (error instanceof z.ZodError) {
				console.error('Validation error:', error.issues);
				const errors: Record<string, string> = {};
				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						errors[issue.path[0] as string] = issue.message;
					}
				});
				return { errors };
			}
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
