import { query } from '$app/server';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const getAdmins = query(async () => {
	const admins = await db
		.select({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			email: user.email,
			role: user.role
		})
		.from(user)
		.where(eq(user.role, 'admin'));
	return admins;
});
